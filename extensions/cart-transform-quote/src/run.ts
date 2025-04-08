import type {
  RunInput,
  FunctionRunResult,
} from "../generated/api";

const NO_CHANGES: FunctionRunResult = {
  operations: [],
};

const UPDATE_PRICE: FunctionRunResult = {
  operations: [{
    update: {
      cartLineId: 'gid://shopify/CartLine/1236fdaa-f5aa-4d74-a926-bf3f1fe73bc2',
      "price": {
        "adjustment": {
          "fixedPricePerUnit": {
            "amount": "200"
          }
        }
      }
    }
  }],
};

export function run(input: RunInput): FunctionRunResult {
  console.log("---------------", JSON.stringify(input));

  return NO_CHANGES;
};
