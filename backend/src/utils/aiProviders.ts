import axios from 'axios';
import env from '../config/env';
import logger from './logger';

export interface AIProviderResponse {
  text: string;
  tokensUsed: number;
}

export interface AIProvider {
  generateCompletion(prompt: string, systemPrompt?: string): Promise<AIProviderResponse>;
}

// ----------------------------------------------------
// 1. OpenAI Provider
// ----------------------------------------------------
export class OpenAIProvider implements AIProvider {
  private apiKey: string;
  private model: string;

  constructor() {
    this.apiKey = env.OPENAI_API_KEY || '';
    this.model = env.OPENAI_MODEL;
  }

  async generateCompletion(prompt: string, systemPrompt?: string): Promise<AIProviderResponse> {
    if (!this.apiKey) {
      logger.warn('[AI OpenAI] API key not configured. Falling back to MockProvider.');
      return new MockProvider().generateCompletion(prompt, systemPrompt);
    }

    try {
      const messages = [];
      if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt });
      }
      messages.push({ role: 'user', content: prompt });

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: this.model,
          messages,
          temperature: 0.7,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
          timeout: 15000,
        }
      );

      const text = response.data.choices[0].message.content || '';
      const tokensUsed = response.data.usage?.total_tokens || 0;

      return { text, tokensUsed };
    } catch (error: any) {
      logger.error(`[AI OpenAI] Error occurred: ${error.message}`);
      // Fallback to mock on connection issues
      return new MockProvider().generateCompletion(prompt, systemPrompt);
    }
  }
}

// ----------------------------------------------------
// 2. Gemini Provider
// ----------------------------------------------------
export class GeminiProvider implements AIProvider {
  private apiKey: string;
  private model: string;

  constructor() {
    this.apiKey = env.GEMINI_API_KEY || '';
    this.model = env.GEMINI_MODEL;
  }

  async generateCompletion(prompt: string, systemPrompt?: string): Promise<AIProviderResponse> {
    if (!this.apiKey) {
      logger.warn('[AI Gemini] API key not configured. Falling back to MockProvider.');
      return new MockProvider().generateCompletion(prompt, systemPrompt);
    }

    try {
      const systemInstruction = systemPrompt ? { parts: [{ text: systemPrompt }] } : undefined;
      const contents = [{ role: 'user', parts: [{ text: prompt }] }];

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
      const response = await axios.post(
        url,
        {
          contents,
          systemInstruction,
          generationConfig: {
            temperature: 0.7,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        }
      );

      const text = response.data.candidates[0].content.parts[0].text || '';
      // Estimate token count if not provided directly
      const tokensUsed = Math.round((prompt.length + text.length) / 4);

      return { text, tokensUsed };
    } catch (error: any) {
      logger.error(`[AI Gemini] Error occurred: ${error.message}`);
      return new MockProvider().generateCompletion(prompt, systemPrompt);
    }
  }
}

// ----------------------------------------------------
// 3. Ollama Provider (Local LLMs)
// ----------------------------------------------------
export class OllamaProvider implements AIProvider {
  private baseUrl: string;
  private model: string;

  constructor() {
    this.baseUrl = env.OLLAMA_URL;
    this.model = env.OLLAMA_MODEL;
  }

  async generateCompletion(prompt: string, systemPrompt?: string): Promise<AIProviderResponse> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/api/chat`,
        {
          model: this.model,
          messages: [
            ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
            { role: 'user', content: prompt }
          ],
          stream: false,
          options: {
            temperature: 0.7,
          }
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 20000,
        }
      );

      const text = response.data.message?.content || '';
      const tokensUsed = Math.round((prompt.length + text.length) / 4);

      return { text, tokensUsed };
    } catch (error: any) {
      logger.error(`[AI Ollama] Connection failed: ${error.message}. Falling back to MockProvider.`);
      return new MockProvider().generateCompletion(prompt, systemPrompt);
    }
  }
}

// ----------------------------------------------------
// 4. Mock Provider (Default fallback / demo mode)
// ----------------------------------------------------
export class MockProvider implements AIProvider {
  async generateCompletion(prompt: string, systemPrompt?: string): Promise<AIProviderResponse> {
    // Generate context-aware mock responses based on terms in the prompt.
    const query = prompt.toLowerCase();
    let text = '';

    if (query.includes('employee') && query.includes('leave')) {
      text = `### Leave Balance & Active Requests Status

Based on current database records, here are the employees on leave today:

| Employee Code | Name | Department | Leave Type | Duration | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **EMP-002** | Sarah Jenkins | Engineering | ANNUAL | Jul 10 - Jul 14 | APPROVED |
| **EMP-004** | Michael Chang | Sales | SICK | Jul 10 - Jul 10 | APPROVED |

**Key Metric Summary:**
* **Total Employees on Leave Today:** 2
* **Pending Leave Requests:** 1 (Awaiting Dept Head approval)
* **Average Team Leave Rate:** 4.2%

Would you like to draft a summary broadcast for the relevant department heads?`;
    } 
    else if (query.includes('overdue') && query.includes('invoice')) {
      text = `### Accounts Receivable: Overdue Invoices Report

The database has identified the following customer invoices that are past their payment due dates:

| Invoice # | Customer | Amount (USD) | Issued Date | Due Date | Days Overdue | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **INV-2026-004** | Global Trading Corp | $12,450.00 | Jun 05, 2026 | Jul 05, 2026 | 5 Days | OVERDUE |
| **INV-2026-008** | Acme Industry Inc | $8,200.00 | May 28, 2026 | Jun 28, 2026 | 12 Days | OVERDUE |
| **INV-2026-012** | Apex Solutions | $4,500.00 | May 10, 2026 | Jun 09, 2026 | 31 Days | OVERDUE |

**Total Overdue Balance:** **$25,150.00**

#### Proactive Recommendations
1. **Send Automatic Reminder:** global-trading-corp is low risk, send automated reminder.
2. **Hold Account credit limit:** apex-solutions is > 30 days overdue, flag lead status.

Would you like me to draft an email reminder template for **Apex Solutions**?`;
    }
    else if (query.includes('selling') && query.includes('product')) {
      text = `### Inventory & Sales: Top Selling Products

Here are the highest performing products based on recent transactions:

| SKU | Product Name | Category | Units Sold | Total Revenue | Stock Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SKU-M1-MAX** | M1 MacBook Pro 14" | Electronics | 145 | $288,550.00 | IN STOCK (45) |
| **SKU-IPH-15** | iPhone 15 Pro Max | Electronics | 210 | $230,790.00 | LOW STOCK (8) |
| **SKU-MON-27** | Dell 27" 4K Monitor | Electronics | 98 | $48,900.00 | IN STOCK (120) |

\`\`\`recharts
{
  "type": "bar",
  "data": [
    { "name": "M1 MacBook Pro", "revenue": 288550 },
    { "name": "iPhone 15 Pro", "revenue": 230790 },
    { "name": "Dell 27 Monitor", "revenue": 48900 }
  ],
  "xKey": "name",
  "yKeys": ["revenue"],
  "colors": ["#3b82f6"]
}
\`\`\`

Would you like to initiate a restock recommendation for the **iPhone 15 Pro Max**?`;
    }
    else if (query.includes('attendance') && query.includes('lowest')) {
      text = `### HR Audit: Employees with Lowest Attendance

Here is the attendance report listing team members with the lowest attendance rates for the current month:

| Employee Code | Name | Department | Days Present | Late Arrivals | Attendance Rate |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **EMP-007** | David Miller | Marketing | 14 / 20 | 5 | **70.0%** |
| **EMP-012** | Jessica Taylor | Human Resources | 15 / 20 | 3 | **75.0%** |
| **EMP-009** | Robert Wilson | Engineering | 16 / 20 | 1 | **80.0%** |

**System Warning:** EMP-007 (David Miller) shows a high attrition risk score due to repeated lates and absences.

Would you like me to schedule a performance check-in draft email?`;
    }
    else if (query.includes('cash') && query.includes('balance')) {
      text = `### Finance: Bank Account Balances & Cash Flow Summary

Here is the current cash distribution across all active company bank accounts:

| Bank Name | Account Name | Account Number | Currency | Current Balance |
| :--- | :--- | :--- | :--- | :--- |
| **Chase Manhattan** | Corporate Operating | *******4829 | USD | $342,850.20 |
| **HSBC Commercial** | International Trade | *******1083 | EUR | €112,400.00 |
| **Silicon Valley Bank** | Venture/Payroll | *******9923 | USD | $45,190.50 |

**Total Consolidated Cash (USD Equiv):** **$464,490.20**

\`\`\`recharts
{
  "type": "pie",
  "data": [
    { "name": "Chase Operating", "value": 342850 },
    { "name": "HSBC Trade (USD)", "value": 121500 },
    { "name": "SVB Payroll", "value": 45190 }
  ],
  "colors": ["#10b981", "#3b82f6", "#f59e0b"]
}
\`\`\`

Cash levels are currently **healthy**. Operational runway is estimated at **8.5 months**.`;
    }
    else if (query.includes('pending') && query.includes('purchase order')) {
      text = `### Supply Chain: Pending Purchase Orders

The following purchase orders are currently awaiting vendor delivery or internal authorization:

| PO Number | Vendor Name | Order Date | Total Amount | Status | Delay Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **PO-2026-003** | TechDistributors Inc | Jul 01, 2026 | $18,400.00 | SUBMITTED | Awaiting Shipment |
| **PO-2026-005** | Apex Logistics | Jul 04, 2026 | $6,200.00 | DRAFT | Awaiting Approval |
| **PO-2026-007** | OfficeSupplies Corp | Jun 20, 2026 | $2,100.00 | APPROVED | **DELAYED (4 Days)** |

**Action Recommended:** Send follow-up email to **OfficeSupplies Corp** regarding the delayed delivery of PO-2026-007.

Would you like me to generate a follow-up email draft?`;
    }
    else {
      // General response
      text = `### Amdox ERP Copilot Response

I have processed your query: *"${prompt}"*

Based on the metadata analyzed from the ERP systems:
1. **Multi-tenant context:** Enforced (Tenant ID: Active)
2. **Access Role:** Authenticated ERP user.
3. **Module Scope:** General Copilot assistance.

**Suggested actions:**
* Ask me to analyze specific reports: "Generate Financial Summary" or "Show overdue invoices".
* Search files in DMS: "Find all PDF documents shared this week".
* View SCM status: "Show low stock products".

Please let me know how I can assist you further with ERP actions.`;
    }

    // Return mock response with estimated tokens used
    return {
      text,
      tokensUsed: Math.round((prompt.length + text.length) / 4)
    };
  }
}

// ----------------------------------------------------
// 5. Provider Factory
// ----------------------------------------------------
export class AIProviderFactory {
  static getProvider(): AIProvider {
    const providerType = (env.AI_PROVIDER || 'MOCK').toUpperCase();

    logger.info(`[AI Provider] Initializing ${providerType} Provider`);

    switch (providerType) {
      case 'OPENAI':
        return new OpenAIProvider();
      case 'GEMINI':
        return new GeminiProvider();
      case 'OLLAMA':
        return new OllamaProvider();
      case 'MOCK':
      default:
        return new MockProvider();
    }
  }
}

export default AIProviderFactory;
