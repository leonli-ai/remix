import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { loggerService } from '~/lib/logger';
import { z } from 'zod';
import { OpenRouterLimitService } from './openrouter-limit.service';

/**
 * Configuration options for AI requests
 */
interface AIRequestOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Address schema
 */
const AddressSchema = z.object({
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  name: z.string().nullable().optional(),
  company: z.string().nullable(),
  address1: z.string().nullable(),
  address2: z.string().nullable(),
  city: z.string().nullable(),
  province: z.string().nullable(),
  zip: z.string().nullable(),
  country: z.string().nullable(),
  phone: z.string().nullable().optional(),
  countryCode: z.string().nullable().optional(),
  provinceCode: z.string().nullable().optional(),
});

/**
 * Line item property schema
 */
const ItemPropertySchema = z.object({
  name: z.string(),
  value: z.string(),
});

/**
 * Order line item schema
 */
const OrderItemSchema = z.object({
  customerPartNumber: z.string().nullable(),
  sku: z.string().nullable(),
  name: z.string(),
  quantity: z.number().positive(),
  price: z.number(),
  taxable: z.boolean().nullable().default(false),
  properties: z.array(ItemPropertySchema).optional(),
});

/**
 * Purchase order schema for validation
 */
const PurchaseOrderSchema = z.object({
  orderNumber: z.string().nullable().optional(),
  date: z.string().nullable().transform(val => {
    if (!val) {
      // If date is null, use current date
      return new Date().toISOString().split('T')[0];
    }
    // Try to parse and format the date
    try {
      const date = new Date(val);
      if (isNaN(date.getTime())) {
        return new Date().toISOString().split('T')[0];
      }
      return date.toISOString().split('T')[0];
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  }),
  customerName: z.string().nullable().optional(),
  customerEmail: z.string().nullable().optional(),
  customerPhone: z.string().nullable().optional(),
  billingAddress: AddressSchema,
  shippingAddress: AddressSchema,
  items: z.array(OrderItemSchema).transform(items => {
    return items.map(item => {
      // Handle product code splitting
      if (item.sku && item.sku.includes(' ')) {
        const [partNumber, sku] = item.sku.split(' ');
        return {
          ...item,
          customerPartNumber: partNumber,
          sku: sku
        };
      }
      return item;
    });
  }),
  currency: z.string().nullable().transform(val => val || 'USD'),
  taxExempt: z.boolean().nullable().default(false),
  poNumber: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
  shippingMethod: z.string().nullable().optional(),
  paymentTerms: z.string().nullable().optional(),
  subtotalPrice: z.number().nullable().optional(),
  totalTax: z.number().default(0),
  totalShipping: z.number().default(0),
  totalDiscounts: z.number().nullable().default(0),
  totalPrice: z.number(),
}).transform(data => {
  // Ensure shippingAddress defaults to billingAddress if not different
  if (JSON.stringify(data.shippingAddress) === JSON.stringify({
    firstName: null,
    lastName: null,
    name: null,
    company: null,
    address1: null,
    address2: null,
    city: null,
    province: null,
    zip: null,
    country: null,
    phone: null,
    countryCode: null,
    provinceCode: null
  })) {
    data.shippingAddress = data.billingAddress;
  }
  return data;
});

export type PurchaseOrder = z.infer<typeof PurchaseOrderSchema>;

/**
 * Unified service for AI-powered document analysis
 */
export class VercelAiService {
  private readonly CLASS_NAME = 'VercelAiService';
  private readonly DEFAULT_MODEL = 'google/gemini-2.0-flash-001';
  private readonly DEFAULT_API_BASE_URL = 'https://openrouter.ai/api/v1';
  private readonly DEFAULT_TEMPERATURE = 0;
  private readonly apiKey: string;
  private readonly baseURL: string;
  private readonly limitService: OpenRouterLimitService;

  constructor() {
    this.apiKey = process.env.API_KEY || '';
    this.baseURL = process.env.BASE_URL || this.DEFAULT_API_BASE_URL;
    
    if (!this.apiKey) {
      throw new Error('API_KEY environment variable is required');
    }

    // Initialize OpenRouter limit service
    this.limitService = OpenRouterLimitService.getInstance({
      maxUsagePercentage: Number(process.env.OPENROUTER_MAX_USAGE_PERCENTAGE) || 80,
      emailNotificationEnabled: true,
      notificationEmail: process.env.NOTIFICATION_EMAIL
    });
  }

  /**
   * Creates an LLM model instance for the request
   */
  private async createLLMModel(model: string = this.DEFAULT_MODEL) {
    // Check usage limits before creating model
    const isWithinLimits = await this.limitService.checkLimit();
    if (!isWithinLimits) {
      throw new Error('OpenRouter API usage limit exceeded');
    }

    return createOpenAI({
      baseURL: this.baseURL,
      compatibility: 'strict',
      apiKey: this.apiKey,
    })(model);
  }

  /**
   * Extract purchase order information from an image or multiple images
   */
  public async extractPurchaseOrder(
    imageData: Buffer | Buffer[],
    options: AIRequestOptions = {}
  ): Promise<PurchaseOrder> {
    const METHOD = 'extractPurchaseOrder';
    try {
      this.validateImageData(imageData);
      this.logInfo(METHOD, 'Starting purchase order extraction', {
        imageCount: Array.isArray(imageData) ? imageData.length : 1,
        options
      });

      const llmModel = await this.createLLMModel(options.model);
      const messages = this.createMessages(imageData);
      const response = await this.generateAIResponse(llmModel, messages, options);
      const parsedData = await this.processAIResponse(response, METHOD);

      this.logInfo(METHOD, 'Successfully extracted purchase order', {
        orderNumber: parsedData.orderNumber,
        itemCount: parsedData.items.length,
        pageCount: Array.isArray(imageData) ? imageData.length : 1
      });

      return parsedData;
    } catch (error) {
      this.logError(METHOD, 'Failed to extract purchase order', error, {
        imageCount: Array.isArray(imageData) ? imageData.length : 1
      });
      throw error;
    }
  }

  private validateImageData(imageData: Buffer | Buffer[]): void {
    if (!imageData || (Array.isArray(imageData) && imageData.length === 0)) {
      throw new Error('Image data is required');
    }
  }

  private createMessages(imageData: Buffer | Buffer[]): Array<{ role: 'system' | 'user'; content: any }> {
    const imageContents = Array.isArray(imageData) ? imageData : [imageData];
    
    return [
      {
        role: 'system',
        content: this.getPurchaseOrderPrompt()
      },
      {
        role: 'user',
        content: [
          ...imageContents.map(img => ({
            type: 'image',
            image: img.toString('base64')
          })),
          {
            type: 'text',
            text: 'Extract all purchase order information from these images. If there are multiple pages, combine the information appropriately. Pay special attention to required fields and use appropriate default values for missing optional fields.'
          }
        ]
      }
    ];
  }

  private async generateAIResponse(
    model: any,
    messages: Array<{ role: 'system' | 'user'; content: any }>,
    options: AIRequestOptions
  ): Promise<string> {
    const { text } = await generateText({
      model,
      messages,
      temperature: options.temperature || this.DEFAULT_TEMPERATURE,
      maxTokens: options.maxTokens,
    });

    if (!text) {
      throw new Error('AI returned empty response');
    }

    return text;
  }

  private async processAIResponse(text: string, method: string): Promise<PurchaseOrder> {
    const cleanedJson = this.cleanJsonResponse(text);
    return this.validatePurchaseOrder(cleanedJson);
  }

  private logInfo(method: string, message: string, data?: Record<string, any>): void {
    loggerService.info(`${this.CLASS_NAME}.${method}: ${message}`, data);
  }

  private logError(method: string, message: string, error: unknown, data?: Record<string, any>): void {
    loggerService.error(`${this.CLASS_NAME}.${method}: ${message}`, {
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : 'Unknown error',
      ...data
    });
  }

  /**
   * Extract purchase order information from text content
   */
  public async extractPurchaseOrderFromText(
    text: string,
    options: AIRequestOptions = {}
  ): Promise<PurchaseOrder> {
    const METHOD = 'extractPurchaseOrderFromText';
    try {
      if (!text) {
        throw new Error('Text content is required');
      }

      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Starting purchase order extraction from text`, {
        textLength: text.length,
        options
      });

      const llmModel = await this.createLLMModel(options.model);

      const messages = [
        {
          role: 'system' as const,
          content: this.getPurchaseOrderPrompt()
        },
        {
          role: 'user' as const,
          content: `Extract purchase order information from the following text:\n\n${text}`
        }
      ];

      const { text: responseText } = await generateText({
        model: llmModel,
        messages,
        temperature: options.temperature || 0,
        maxTokens: options.maxTokens,
      });

      if (!responseText) {
        throw new Error('AI returned empty response');
      }

      const cleanedJson = this.cleanJsonResponse(responseText);
      const parsedData = await this.validatePurchaseOrder(cleanedJson);

      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Successfully extracted purchase order from text`, {
        orderNumber: parsedData.orderNumber,
        itemCount: parsedData.items.length
      });

      return parsedData;
    } catch (error) {
      loggerService.error(`${this.CLASS_NAME}.${METHOD}: Failed to extract purchase order from text`, {
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack,
          name: error.name
        } : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Clean JSON response by removing markdown and non-JSON content
   */
  private cleanJsonResponse(text: string): string {
    if (!text) {
      throw new Error('Input text is required');
    }

    try {
      // Remove markdown code block markers and clean whitespace
      let cleaned = text.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
      
      // Extract JSON object if found
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const possibleJson = jsonMatch[0];
        JSON.parse(possibleJson); // Validate JSON
        return possibleJson;
      }
      
      throw new Error('No valid JSON structure found in the response');
    } catch (error) {
      throw new Error(`Failed to clean JSON response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate purchase order data against schema
   */
  private async validatePurchaseOrder(jsonString: string): Promise<PurchaseOrder> {
    try {
      const data = JSON.parse(jsonString);
      return PurchaseOrderSchema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const issues = error.issues.map(issue => ({
          path: issue.path.join('.'),
          message: issue.message
        }));
        throw new Error(`Invalid purchase order data: ${JSON.stringify(issues)}`);
      }
      throw error;
    }
  }

  /**
   * Get the system prompt for purchase order extraction
   */
  private getPurchaseOrderPrompt(): string {
    return `You are a specialized AI assistant for B2B e-commerce document processing. Your task is to extract structured order information from purchase order (PO) documents.

IMPORTANT: Return ONLY the raw JSON object. Do NOT wrap the response in markdown code blocks (no \`\`\`json). Do NOT include any explanations or additional text.

Analyze the document carefully and extract the following information in a clean JSON format that can be used to create a Shopify draft order:

{
  "orderNumber": string,         // The system's internal reference number, usually starting with "#". This is NOT the customer's PO number. (REQUIRED)
  "date": string,                // Order date in YYYY-MM-DD format (REQUIRED)
  "customerName": string,        // Name of the customer or company placing the order (REQUIRED)
  "customerEmail": string,       // Email address of the customer (use null if not found)
  "customerPhone": string,       // Phone number of the customer (use null if not found)
  "billingAddress": {            // Billing address information (REQUIRED)
    "firstName": string,         // First name (use null if not found)
    "lastName": string,          // Last name (use null if not found)
    "name": string,              // Full name (use null if not found)
    "company": string,           // Company name (use null if not found)
    "address1": string,          // Street address line 1 (use null if not found)
    "address2": string,          // Street address line 2 (use null if not found)
    "city": string,              // City (use null if not found)
    "province": string,          // State/Province (use null if not found)
    "zip": string,               // ZIP/Postal code (use null if not found)
    "country": string,           // Country (use null if not found)
    "phone": string,             // Phone number (use null if not found)
    "countryCode": string,       // Two-letter country code (use null if not found)
    "provinceCode": string       // Province/state code (use null if not found)
  },
  "shippingAddress": {           // Shipping address (if different from billing, otherwise use same as billing)
    "firstName": string,         // First name (use null if not found)
    "lastName": string,          // Last name (use null if not found)
    "name": string,              // Full name (use null if not found)
    "company": string,           // Company name (use null if not found, do NOT copy from customer name)
    "address1": string,          // Street address line 1 (use null if not found)
    "address2": string,          // Street address line 2 (use null if not found)
    "city": string,              // City (use null if not found)
    "province": string,          // State/Province (use null if not found)
    "zip": string,               // ZIP/Postal code (use null if not found)
    "country": string,           // Country (use null if not found)
    "phone": string,             // Phone number (use null if not found)
    "countryCode": string,       // Two-letter country code (use null if not found)
    "provinceCode": string       // Province/state code (use null if not found)
  },
  "items": [                     // Line items in the order (REQUIRED, at least one item)
    {
      "customerPartNumber": string, // Customer's own part number or reference number. If a product code contains two parts separated by space (e.g., "DFCMFHS1 240001"), the first part should be customerPartNumber and the second part should be SKU
      "sku": string,             // Product SKU or ID. If a product code contains two parts separated by space, use the second part as SKU
      "name": string,            // Product name or description (REQUIRED)
      "quantity": number,        // Quantity ordered (REQUIRED)
      "price": number,           // Unit price (REQUIRED)
      "taxable": boolean,        // Whether the item is taxable (use null if unclear)
      "properties": [            // Any additional properties (optional)
        {
          "name": string,
          "value": string
        }
      ]
    }
  ],
  "currency": string,            // Currency code (e.g., USD, EUR, CNY) (use null if not found, will default to USD)
  "taxExempt": boolean,          // Whether the order is tax exempt (use null if unclear)
  "poNumber": string,            // IMPORTANT: The customer's Purchase Order (PO) number. Look for fields labeled as "PO Number", "Purchase Order Number", "PO #", etc. This is a critical field and must be different from orderNumber. Do not use the system's order reference number here. (REQUIRED)
  "note": string,                // Any additional notes or special instructions (use null if none)
  "shippingMethod": string,      // Requested shipping method (use null if not specified)
  "paymentTerms": string,        // Payment terms e.g., Net 30, COD (use null if not specified)
  "subtotalPrice": number,       // Subtotal before tax and shipping (REQUIRED)
  "totalTax": number,            // Total tax amount (use 0 if not specified)
  "totalShipping": number,       // Total shipping cost (use 0 if not specified)
  "totalDiscounts": number,      // Total discounts applied (use 0 if none)
  "totalPrice": number           // Grand total including tax and shipping (REQUIRED)
}

IMPORTANT NOTES:
1. For required fields (marked as REQUIRED), you must extract a valid value.
2. For optional fields, use null when the information is not found.
3. For numeric fields that should be 0 when not specified (like totalDiscounts, totalTax), use 0 instead of null.
4. For boolean fields where the value is not clearly indicated, use null.
5. Pay special attention to the difference between orderNumber and poNumber:
   - orderNumber is the system's internal reference (e.g., "#1108")
   - poNumber is the customer's purchase order number (e.g., "11111", "PO-12345")
   - These should NEVER be the same value
   - If you find a number labeled as "PO Number" or similar, it MUST go into poNumber, not orderNumber
6. If shipping address is not specified or is the same as billing, copy the billing address values.
7. For addresses:
   - Parse address1 and address2 correctly. address1 should contain the street number and name, address2 should contain apartment/suite numbers or additional info.
   - Do NOT put city, state, or zip in address1 or address2 fields.
   - If a city appears with a dash (e.g., "Miami Beach - South Beach"), put the full text in city field.
   - Do NOT put the company name in the shipping address unless it's explicitly mentioned as the ship-to company.
8. For product codes:
   - When a product code contains two parts separated by space (e.g., "DFCMFHS1 240001"):
     * The first part (e.g., "DFCMFHS1") should be assigned to customerPartNumber
     * The second part (e.g., "240001") should be assigned to sku
   - If there's only one part, it should be assigned to sku and customerPartNumber should be null

Focus on accuracy and completeness. Extract all visible information that fits into this structure.

REMEMBER: Return ONLY the raw JSON object without any markdown formatting or additional text.`;
  }
}

export const vercelAiService = new VercelAiService(); 