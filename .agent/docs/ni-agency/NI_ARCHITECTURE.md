# NI Agency Architecture: Engineering & Safety Standards

This document defines the technical architecture for the Navera Intelligence (NI) agency, focusing on hallucination reduction, deterministic outcomes, and token efficiency.

---

## 🏛️ The Three-Persona Framework
To maintain clear boundaries and minimize cognitive load per API call, the agency is limited to exactly **3 digital personas**:

1.  **The Intake Clerk** (Operational / Data-Focused)
2.  **The Senior Partner** (Strategic / Analytical)
3.  **The Chief of Staff** (Execution / Global Interface)

---

## 🛡️ Anti-Hallucination Strategy: Deterministic Intercepts

Accounting requires 100% precision. We never rely on the LLM for arithmetic or data structure validation. We implement a **"Logic-First, AI-Second"** pipeline:

### 1. The Validation Layer (Hard-Coded Scripts)
Every proposal from an AI Persona must pass through a **Deterministic Validator** before it is presented to the user.
- **Math Check**: `abs(Total - (Subtotal + Tax)) < 0.001`.
- **Schema Check**: Any draft must conform to the `PostEntryParams` TypeScript interface.
- **Reference Check**: Personas cannot suggest an `accountId` that does not exist in the current Chart of Accounts.

### 2. Priority of Categorization
When reconciling or recording data, the system follows this deterministic order:
1. **Rule Match (Deterministic)**: If a `BankRule` pattern matches, the rule is applied. The AI is informed, but not consulted.
2. **Historical Match (Deterministic)**: If a 100% identical transaction (Entity + Amount) exists in history, suggest that category.
3. **AI Inference (Persona-Based)**: If the above fail, the `Intake Clerk` proposes a category based on the account labels.

---

## 📏 Token Optimization Protocol

To minimize API costs and latency, the system enforces **Minimal Token Usage**:

### 1. Context Truncation
- **Filtered Account List**: Do not send the full 100+ accounts. Use a script to send only accounts relevant to the Transaction Type (e.g., show only Revenue accounts for Invoices).
- **Recent Context**: Only send the last 5 relevant ledger entries for pattern matching, not the entire history.

### 2. Optimized Responses
- **Tool-First Interaction**: Use "Function Calling" models. The AI should prioritize generating a JSON tool call over natural language text. 
- **Summary Injection**: Instead of raw data, the system provides a script-generated "Financial Summary" (e.g., *"P&L Current Month: +$4.5k net"*).

### 3. Tiered Model Usage
- **Fast Tier (Gemini Flash)**: Used by the **Intake Clerk** for extraction and simple matching.
- **Reasoning Tier (Gemini Pro)**: Used by the **Senior Partner** only for complex audits or multi-step analysis.

---

## 🧪 Testing & Environment
### 1. Required Variables
- `GOOGLE_GENERATIVE_AI_API_KEY`: Required for multimodal vision and persona reasoning.

### 2. Testing Requirement
Every AI tool must have a corresponding **Deterministic Test Mock**. 
- A test where the AI proposes a "balanced" entry that is actually $0.01 off.
- The system must prove that the **Validation Layer** blocks the entry before the user sees it.
