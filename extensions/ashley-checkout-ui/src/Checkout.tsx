import {
  reactExtension,
  BlockStack,
  Text,
  useTranslate,
  InlineLayout,
  View,
  Image,
  Heading,
  Link,
  useSubtotalAmount,
  useApplyDiscountCodeChange,
  useAttributeValues,
  useDiscountCodes,
  useApi
} from '@shopify/ui-extensions-react/checkout';
import {useEffect} from 'react';

// 1. Choose an extension target
export default reactExtension("purchase.checkout.block.render", () => (
  <Extension />
));

const LOG_PREFIX = '[Checkout UI Extension]';

function Extension() {
  const translate = useTranslate();
  const cost = useSubtotalAmount()
  const plccApproved = useAttributeValues(['plccApproved']);
  const appliedDiscountCode = useDiscountCodes();
  const applyDiscountCodeChange = useApplyDiscountCodeChange();
  const {shop} = useApi();


  useEffect(() => {
    const handleDiscountCodes = async () => {
      if (plccApproved[0] && plccApproved[0] !== 'false') {
        console.log(`${LOG_PREFIX} Adding discount code`);
        await applyDiscountCodeChange({
          type: 'addDiscountCode',
          code: '20% ashley plcc discount'
        });
      } else if (!plccApproved[0] || plccApproved[0] === 'false') {
        await applyDiscountCodeChange({
          type: 'removeDiscountCode',
          code: '20% ashley plcc discount'
        });
      }
    };

    handleDiscountCodes();
  }, [JSON.stringify(appliedDiscountCode), JSON.stringify(plccApproved)]);

  if(plccApproved[0] && plccApproved[0] !== 'false') {
    return null;
  }

  // 3. Render a UI
  return (
    <BlockStack background={'subdued'} spacing={'none'} border={"dotted"} padding={"none"}>
      <InlineLayout padding={['tight', 'none']} columns={[100, 'fill']}>
        <View border="none" padding={['base', 'none', 'base', 'base']}>
          <Image source="https://www.ashleystewart.com/on/demandware.static/Sites-AshleyStewart-Site/-/default/dwc63767c1/images/as-card-logo.png?sw=98" />
        </View>
        <View border="none" padding="base">
          <Heading level={2}>{translate("ashleyStewartCreditCard")}</Heading>
          <Text>
            {translate("creditCardBenefits", {
              target: (cost.amount*100 * 0.002).toFixed(2)
            })}
          </Text>
        </View>
      </InlineLayout>
      <InlineLayout columns={['50%', '50%']}>
        <View inlineAlignment={'center'} blockAlignment={'center'} border={['base','base', 'none', 'none']} padding={'base'}>
          <Link to={'https://'+shop.myshopifyDomain+'/pages/credit-app-landing?apply=true'}>
            Apply Now
          </Link>
        </View>
        <View inlineAlignment={'center'} blockAlignment={'center'} border={['base', 'none', 'none', 'none']} padding={'base'}>
          <Link to={'https://'+shop.myshopifyDomain+'/pages/credit-app-landing'}>
            Learn More
          </Link>
        </View>
      </InlineLayout>
    </BlockStack>
  );
}
