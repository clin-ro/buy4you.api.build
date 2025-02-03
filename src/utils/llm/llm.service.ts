import { Contact } from '@/schemas/mongo/common.schema';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CoreMessage, streamObject } from 'ai';
import { z, ZodType, ZodTypeDef } from 'zod';
class LLMMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}
type LLMConversation = LLMMessage[];

type LLMInput = LLMConversation | LLMMessage | string[] | string;
@Injectable()
export class LlmService {
  private readonly googleModel;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GOOGLE_API_KEY');
    if (!apiKey) {
      throw new Error('GOOGLE_API_KEY not found in environment variables');
    }
    const google = createGoogleGenerativeAI({ apiKey });
    this.googleModel = google('gemini-2.0-flash-exp');
  }

  private generateConversationFromPrompt(messages?: LLMInput, system?: string): LLMConversation {
    const conversation: LLMConversation = [];
    switch (typeof messages) {
      case 'string':
        if (typeof system === 'string') {
          conversation.push({ role: 'system' as const, content: system });
        }
        conversation.push({ role: 'user' as const, content: messages as string });
        break;
      case 'object':
        if (Array.isArray(messages)) {
          conversation.push(...messages as LLMConversation);
        } else {
          conversation.push(messages as LLMMessage);
        }
        break;
    }

    return conversation;
  }

  async generateFromPrompt<T>(messages: LLMInput, schema: any, onPartialResult?: (partial: Partial<T>) => void | Promise<void>): Promise<T | undefined> {
    const conversation = this.generateConversationFromPrompt(messages);
    const result = streamObject({
      model: this.googleModel,
      schema,
      messages: conversation
    });
    let finalObject: T | undefined;
    for await (const partialObject of result.partialObjectStream) {
      finalObject = partialObject as T;
      await onPartialResult?.(partialObject as Partial<T>);
    }
    return finalObject;
  }

  async streamFromPdf<T>(
    pdfBuffer: Buffer,
    schema: ZodType<unknown, ZodTypeDef, any>,
    onPartialResult: (partial: Partial<T>) => void | Promise<void>
  ): Promise<T | undefined> {
    try {
      const conversation = [
        {
          role: 'system',
          content: `
                    You are a helpful assistant that extracts information from PDFs.
                    

                    for the units of measure, use the following mapping:
                  

                    [
  {
    "name": "Meter",
    "unit": "m",
    "description": "Base unit of length in the metric system."
  },
  {
    "name": "Centimeter",
    "unit": "cm",
    "description": "A unit of length equal to 1/100th of a meter."
  },
  {
    "name": "Millimeter",
    "unit": "mm",
    "description": "A unit of length equal to 1/1000th of a meter."
  },
  {
    "name": "Kilometer",
    "unit": "km",
    "description": "A unit of length equal to 1000 meters."
  },
  {
    "name": "Inch",
    "unit": "in",
    "description": "A unit of length in the imperial system."
  },
  {
    "name": "Foot",
    "unit": "ft",
    "description": "A unit of length equal to 12 inches."
  },
  {
    "name": "Yard",
    "unit": "yd",
    "description": "A unit of length equal to 3 feet."
  },
   {
    "name": "Mile",
    "unit": "mi",
    "description": "A unit of length equal to 5280 feet."
  },
  {
    "name": "Gram",
    "unit": "g",
    "description": "A unit of mass/weight in the metric system."
  },
  {
    "name": "Milligram",
    "unit": "mg",
    "description": "A unit of mass/weight equal to 1/1000th of a gram."
  },
   {
    "name": "Kilogram",
    "unit": "kg",
    "description":"Base unit of mass/weight in the metric system."
  },
   {
    "name": "Pound",
    "unit": "lb",
    "description": "A unit of mass/weight in the imperial system."
  },
  {
    "name": "Ounce",
    "unit": "oz",
    "description": "A unit of mass/weight in the imperial system."
  },
    {
    "name": "Ton",
    "unit": "short ton",
    "description":"A unit of mass/weight equal to 2000 pounds."
    },
    {
     "name":"Tonne",
     "unit":"metric ton",
     "description": "A unit of mass/weight equal to 1000 kilograms."
    },
  {
    "name": "Liter",
    "unit": "L",
    "description": "A unit of volume/capacity in the metric system."
  },
  {
    "name": "Milliliter",
    "unit": "mL",
    "description": "A unit of volume/capacity equal to 1/1000th of a liter."
  },
   {
    "name": "Cubic centimeter",
    "unit": "cm³",
    "description": "A unit of volume equal to the space of a cube of 1cm side."
    },
   {
    "name": "Cubic meter",
    "unit": "m³",
    "description": "A unit of volume equal to the space of a cube of 1m side."
   },
  {
    "name": "Fluid ounce",
    "unit": "fl oz",
    "description": "A unit of volume/capacity in the imperial system."
  },
  {
    "name": "Pint",
    "unit": "pt",
    "description": "A unit of volume/capacity in the imperial system."
  },
  {
    "name": "Quart",
    "unit": "qt",
    "description":"A unit of volume/capacity in the imperial system."
  },
  {
    "name":"Gallon",
    "unit": "gal",
    "description":"A unit of volume/capacity in the imperial system."
  },
  {
    "name": "Cubic foot",
    "unit": "ft³",
    "description":"A unit of volume equal to the space of a cube of 1ft side."
  },
  {
     "name": "Cubic yard",
    "unit": "yd³",
    "description":"A unit of volume equal to the space of a cube of 1yd side."
   },
  {
     "name": "Square millimeter",
     "unit": "mm²",
     "description": "Unit of area"
    },
   {
     "name":"Square centimeter",
    "unit":"cm²",
    "description":"Unit of area"
    },
    {
      "name": "Square meter",
     "unit": "m²",
     "description":"Unit of area"
   },
   {
    "name":"Square kilometer",
    "unit":"km²",
    "description":"Unit of area"
  },
  {
     "name": "Square inch",
     "unit":"in²",
     "description":"Unit of area"
    },
   {
     "name":"Square foot",
     "unit":"ft²",
     "description":"Unit of area"
  },
   {
    "name":"Square yard",
     "unit": "yd²",
     "description":"Unit of area"
   },
  {
      "name":"Acre",
      "unit":"",
      "description": "Unit of area"
  },
   {
       "name": "Square mile",
      "unit": "mi²",
       "description":"Unit of area"
    },
  {
     "name": "Piece",
    "unit": "pc",
    "description":"Individual item count."
    },
   {
    "name": "Dozen",
    "unit": "dz",
    "description": "Group of 12 items."
  },
  {
    "name": "Gross",
    "unit": "gro",
    "description": "Group of 144 items (12 dozen)."
  },
  {
     "name": "Pair",
    "unit": "pr",
    "description": "Group of 2 items."
    },
    {
    "name":"Set",
    "unit":"",
    "description": "A group of items treated as a single unit."
    },
  {
     "name":"Board Foot",
     "unit":"bft",
     "description":"Unit of lumber volume."
    },
   {
     "name":"1000 Board Feet",
     "unit": "mbf",
     "description":"Unit of lumber volume."
   },
  {
     "name": "Roll",
     "unit": "",
      "description":"Unit for wound materials."
   },
    {
    "name":"Spool",
    "unit":"",
     "description":"Unit for wound materials."
    },
  {
     "name":"Sheet",
     "unit":"",
     "description":"Unit for flat materials (paper, fabric)."
    },
   {
      "name":"Ream",
      "unit":"",
     "description": "Unit for paper (usually 500 sheets)."
    },
  {
     "name": "Bushel",
      "unit": "bu",
      "description":"Unit for dry volume, often produce."
  },
  {
     "name": "Barrel",
     "unit": "bbl",
     "description": "Unit of volume, often for liquids."
  },
  {
     "name":"Bale",
     "unit":"",
      "description":"Unit for compressed goods (hay, cotton)."
  },
  {
    "name":"Drum",
     "unit":"",
     "description": "Cylindrical container for goods."
    },
 {
    "name": "Crate",
    "unit":"",
     "description": "A large shipping container."
    },
    {
    "name":"Pallet",
    "unit":"",
     "description":"Platform for moving goods."
    },
  {
    "name": "Box",
     "unit":"",
    "description":"A rectangular container."
    },
  {
    "name": "Bag",
     "unit":"",
     "description":"Flexible container."
  },
 {
   "name":"Sack",
   "unit":"",
   "description":"Large bag."
  },
  {
   "name":"Carton",
   "unit":"",
    "description": "Cardboard container."
   },
  {
    "name":"Case",
    "unit":"",
    "description": "A container for multiple items."
   },
   {
      "name": "Can",
      "unit":"",
    "description":"Cylindrical metal container."
   },
  {
    "name":"Jar",
    "unit":"",
    "description":"A glass or plastic container."
   },
   {
    "name":"Tube",
    "unit":"",
     "description":"A cylindrical container, often flexible."
   },
   {
    "name":"Vial",
      "unit":"",
    "description": "Small glass container."
    },
   {
     "name":"Pouch",
     "unit":"",
     "description":"Small flexible container."
   },
  {
     "name": "Container",
      "unit":"",
      "description":"Generic term for a storage unit."
   },
  {
   "name":"Tote",
    "unit":"",
     "description":"Large reusable container."
    },
   {
     "name": "Bin",
     "unit":"",
     "description":"Large storage container."
   },
   {
    "name":"Skid",
      "unit":"",
      "description": "Platform for goods (similar to pallet)."
    },
     {
      "name": "Reel",
      "unit":"",
       "description":"Cylindrical object for winding material."
     },
     {
       "name": "Coil",
       "unit":"",
       "description":"Loop of material."
     },
    {
     "name": "Slab",
      "unit":"",
       "description":"Flat, thick piece of material."
    },
    {
     "name":"Block",
      "unit":"",
      "description":"Solid rectangular piece of material."
    },
 {
    "name": "Bolt",
     "unit":"",
     "description":"Roll of fabric or material."
   },
   {
     "name": "Hour",
     "unit": "h",
     "description":"Unit of time."
   },
  {
      "name": "Minute",
      "unit":"min",
       "description":"Unit of time."
   },
   {
      "name":"Day",
      "unit":"",
       "description":"Unit of time."
    },
  {
    "name":"Week",
      "unit":"",
       "description":"Unit of time."
    },
  {
    "name": "Month",
      "unit":"",
      "description": "Unit of time."
    },
  {
    "name":"Year",
      "unit":"",
       "description":"Unit of time."
    },
 {
   "name": "Cord",
   "unit": "cd",
   "description": "Unit of volume for firewood."
  },
  {
     "name": "Quire",
     "unit": "qr",
     "description":"Unit for paper (usually 25 sheets)."
  },
  {
    "name":"Cup",
      "unit": "cup",
     "description":"Unit of volume, often used in cooking."
   },
  {
    "name":"Teaspoon",
      "unit": "tsp",
       "description":"Unit of volume, often used in cooking."
   },
  {
     "name":"Tablespoon",
      "unit":"tbsp",
       "description":"Unit of volume, often used in cooking."
   },
   {
    "name":"Peck",
       "unit":"pk",
       "description":"Unit of dry volume, often used for produce."
    },
    {
    "name":"Batch",
     "unit":"",
       "description":"A group of items produced at once."
    },
      {
     "name": "Skein",
      "unit":"",
        "description":"Coiled or looped length of yarn or thread."
   },
    {
     "name":"Hank",
      "unit":"",
       "description": "Coiled or looped length of yarn or thread."
    },
  {
   "name": "Tray",
      "unit":"",
      "description":"Flat container for carrying items."
  },
  {
    "name": "Pad",
      "unit":"",
      "description":"Stack of flat material."
    },
   {
    "name":"Pail",
      "unit":"",
       "description": "Bucket-like container."
   },
    {
    "name":"Link",
      "unit":"",
      "description":"Unit for chain or similar material."
     },
    {
      "name":"Tier",
       "unit":"",
       "description":"Row or level of items."
     },
    {
     "name":"Rank",
      "unit":"",
       "description":"Row of items."
    }

]
                    `
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Extract information from this PDF.' },
            { type: 'file', data: pdfBuffer, mimeType: 'application/pdf' },
          ],
        },
      ] as CoreMessage[];

      const result = streamObject({
        model: this.googleModel,
        schema,
        messages: conversation,
      });

      let finalObject: any;
      for await (const partialObject of result.partialObjectStream) {
        console.clear();
        finalObject = partialObject;
        await onPartialResult(partialObject as Partial<T>);
      }
      return finalObject;
    } catch (error) {
      console.error('Error in streamFromPdf:', error);
      throw new Error('Failed to process PDF. Please try again.');
    }
  }


  async extractContactFromImage(imageBuffer: Buffer, mimeType: string): Promise<Contact | undefined> {
    console.log('LLM Service: Starting contact extraction');
    console.log('Image buffer size:', imageBuffer.length);
    console.log('MIME type:', mimeType);

    try {
      const conversation = [
        { role: 'system', content: 'Extract contact information from this image.' },
        {
          role: 'user', content: [
            { type: 'text', text: 'Extract the contact information from this image.' },
            { type: 'file', data: imageBuffer, mimeType: mimeType as any },
          ]
        },
      ] as CoreMessage[];

      console.log('LLM Service: Sending request to Google AI');
      const result = streamObject({
        model: this.googleModel,
        schema: z.object({
          name: z.string(),
          email: z.string(),
          phone: z.string(),
          title: z.string().optional(),
          department: z.string().optional(),
        }),
        messages: conversation as CoreMessage[],
      });

      let finalObject: Contact | undefined;
      for await (const partialObject of result.partialObjectStream) {
        console.log('LLM Service: Received partial result:', partialObject);
        finalObject = partialObject as Contact;
      }

      console.log('LLM Service: Final result:', finalObject);
      return finalObject;
    } catch (error) {
      console.error('LLM Service Error:', error);
      throw error;
    }
  }
}

