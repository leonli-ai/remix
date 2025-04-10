import {
  reactExtension,
  Form,
  BlockSpacer,
  useApplyPaymentMethodAttributesChange,
  View,
  TextField,
  useAppMetafields,
  useSelectedPaymentOptions,
  useAttributeValues,
  useApplyAttributeChange,
  useBuyerJourneyIntercept,
} from '@shopify/ui-extensions-react/checkout';
import type { PaymentMethodAttributesUpdateChange} from '@shopify/ui-extensions/checkout';
import {useState, useEffect, useMemo} from 'react';
import debounce from 'lodash.debounce';
import {xor} from 'lodash';

export default reactExtension("purchase.checkout.payment-option-item.details.render", () => (
  <Extension />
));

const LOG_PREFIX = '[Checkout UI Extension]';


function Extension() {
  const callId = useAttributeValues(['callId'])[0];
  const [inValidCardName, setInvalidCardName] = useState(false)
  const [inValidCardNumber, setInvalidCardNumber] = useState(false)
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [maskNumber, setMaskNumber] = useState('')
  const updateAttribute = useApplyAttributeChange()
  const setting = useAppMetafields({namespace: 'environment_setting', key: 'plcc_payment_app_host'})[0];
  const plccPaymentAppHost = setting?.metafield?.value;
  const applyPaymentMethodAttributesChange =
    useApplyPaymentMethodAttributesChange();

  const selectedPaymentOptions = useSelectedPaymentOptions();

  useEffect(() => {
    if(callId && plccPaymentAppHost) {
      fetch(`${plccPaymentAppHost}/app/account/detail`, {
        method: 'POST',
        body: JSON.stringify({callId: callId}),
      }).then((res)=>res.json()).then((data)=>{
        const account = data.data.accountSummary && data.data.accountSummary[0];
        if(account){
          const name = account.name;
          const accountNumber = String(account.accountNumber);
          setCardName(`${name.firstName} ${name.middleInitial} ${name.lastName}`);
          setCardNumber(accountNumber);
          setMaskNumber("************"+accountNumber.slice(-4));
          debouncedSearch(accountNumber);
        }
      })
    }
  }, [callId, plccPaymentAppHost]);

  useEffect(() => {
    if(selectedPaymentOptions[0]?.type !== "customOnsite") {
      updateAttribute({key: 'plcc_last4', value: '', type: 'updateAttribute'});
    }
  }, [JSON.stringify(selectedPaymentOptions)]);

  const debouncedSearch = useMemo(
    () => debounce((value) => {
      if(validateCardNumber(value, maskNumber)) {
        updateAttribute({
          key: 'plcc_last4',
          value: value.slice(-4),
          type: 'updateAttribute',
        });
      }
    }, 300),
    []
  );

  function validateCardNumber(cardNumber, maskNumber) {
    if(maskNumber) {
      return true
    }
    let isValid = true;
    isValid = /^(585637|200|219|1234)\d{5,13}$|^1234$/.test(cardNumber);
    return isValid;
  }


  function getInputValue(newVal,oldVal) {
    let a = newVal.split('')
    let b = oldVal.split('')
    let res = ''
    a.map((value)=>{
      let index = b.indexOf(value);
      if(index !== -1) {
        b.splice(index,1)
      }else{
        res = value
      }
    })
    return res
  }

  function removeNonNumericCharacters(input) {
    return input.replace(/[^0-9]/g, '');
  }

  useEffect(() => {
    if (!cardName || !validateCardNumber(cardNumber, maskNumber)) return;

    const change = {
      type: 'updatePaymentMethodAttributes',
      attributes: [
        { key: 'card_name', value: cardName },
        { key: 'card_number', value: cardNumber },
      ],
    } as PaymentMethodAttributesUpdateChange;

    const applyChange = async () => {
      try {
        const result = await applyPaymentMethodAttributesChange(change);
        console.log(`${LOG_PREFIX} Applied change`, change, result);
      } catch (error) {
        console.error(`${LOG_PREFIX} Failed to apply`, change, error);
      }
    };
    applyChange();
  }, [cardName, cardNumber, maskNumber]);

  const options = useSelectedPaymentOptions();

  useEffect(() => {
    if(options[0]?.type === "customOnsite" && cardName && cardNumber) {
      const change = {
        type: 'updatePaymentMethodAttributes',
        attributes: [
          { key: 'card_name', value: cardName },
          { key: 'card_number', value: cardNumber },
        ],
      } as PaymentMethodAttributesUpdateChange;

      const applyChange = async () => {
        try {
          const result = await applyPaymentMethodAttributesChange(change);
          console.log(`${LOG_PREFIX} Applied change`, change, result);
        } catch (error) {
          console.error(`${LOG_PREFIX} Failed to apply`, change, error);
        }
      };
      applyChange();
    }
  }, [options]);

  useBuyerJourneyIntercept(
    async ( {canBlockProgress}) => {
        if((cardName === '' || !validateCardNumber(cardNumber, maskNumber)) && canBlockProgress && selectedPaymentOptions[0]?.type === "customOnsite") {
          return {
            behavior: 'block',
            reason: 'Invalid card name',
            perform: (result) => {
              if (result.behavior === "block") {
                setInvalidCardName(cardName === '');
                setInvalidCardNumber(!validateCardNumber(cardNumber, maskNumber));
              }
            },
          };
        }
        return {
          behavior: 'allow',
        }
    },
  );


  return (
    <Form onSubmit={() => {}}>
        <View>
          <TextField
            error={inValidCardName ? 'Card Name is invalid' : ''}
            label="Card Name"
            value={cardName}
            required
            onBlur={() => setInvalidCardName(cardName === '')}
            onChange={(newValue: string) => setCardName(newValue)}
          />
          </View>

      <BlockSpacer spacing="loose" />
        <View>
          <TextField
            label="Card Number"
            value={maskNumber||cardNumber}
            // type="number"
            error={inValidCardNumber ? 'Card Number is invalid' : ''}
            required
            onBlur={() => setInvalidCardNumber(!validateCardNumber(cardNumber, maskNumber))}
            onFocus={() => setInvalidCardNumber(false)}
            onInput={(newValue: string) => {
              if(maskNumber) {
                let temp = maskNumber
                setCardNumber('')
                setMaskNumber('')
                if(newValue.length < maskNumber.length) {
                  setCardNumber('')
                }else{
                  const diff = getInputValue(newValue, temp)
                  setCardNumber(removeNonNumericCharacters(diff))
                }
                return
              }else{
                setCardNumber(removeNonNumericCharacters(newValue))
                debouncedSearch(removeNonNumericCharacters(newValue))
              }
            }}
          />
        </View>
    </Form>
  );
}
