Here’s a comprehensive **GitHub README.md** documentation for your Odoo integration project, including the architecture, data flow, and setup instructions.

---

# **Odoo Integration with React Native**

A scalable, modular architecture for integrating **Odoo ERP** with a **React Native** app. This project provides a clean, maintainable, and reusable way to interact with Odoo’s API, manage state, and display data.

---

## **📌 Table of Contents**

1. [Architecture Overview](#-architecture-overview)
2. [Data Flow](#-data-flow)
3. [Project Structure](#-project-structure)
4. [Setup Instructions](#-setup-instructions)
5. [Usage Examples](#-usage-examples)
6. [Testing](#-testing)
7. [Contributing](#-contributing)

---

## **🏗️ Architecture Overview**

### **Layers**

| Layer                      | Purpose                             | Key Files                                                         |
| -------------------------- | ----------------------------------- | ----------------------------------------------------------------- |
| **1. Core Infrastructure** | Centralized configuration and types | `config/odoo.config.ts`, `config/types.ts`, `config/constants.ts` |
| **2. API Client**          | Low-level communication with Odoo   | `lib/OdooClient.ts`                                               |
| **3. Services**            | Business logic for Odoo models      | `services/partner.service.ts`                                     |
| **4. Context/State**       | Global Odoo connection management   | `context/OdooContext.tsx`                                         |
| **5. Custom Hooks**        | Reusable logic for data fetching    | `hooks/usePartners.ts`                                            |
| **6. UI Components**       | Presentational components           | `components/Partner/PartnerCard.tsx`                              |
| **7. Screens**             | Compose everything together         | `app/(tabs)/partners.tsx`                                         |

---

## **🔄 Data Flow**

### **1. Authentication & Connection**

1. **OdooContext** initializes and authenticates with Odoo using `OdooClient`.
2. The authenticated `client` is stored in the context and shared globally.

### **2. Data Fetching**

1. **Custom Hooks** (e.g., `usePartners`) fetch data using the `partnerService`.
2. The `partnerService` uses the `OdooClient` to make API calls.
3. Data is returned to the component via the hook.

### **3. UI Rendering**

1. Components (e.g., `PartnerList`) receive data from hooks.
2. Data is rendered using reusable UI components (e.g., `PartnerCard`).

### **Visual Flow**

```plaintext
OdooContext (Global State)
       ↓
   OdooClient (API Calls)
       ↓
PartnerService (Business Logic)
       ↓
   usePartners (Custom Hook)
       ↓
   PartnerList (UI Component)
       ↓
   PartnerCard (UI Rendering)
```

---

## **📂 Project Structure**

```plaintext
your-project/
├── config/
│   ├── odoo.config.ts      # Odoo connection settings
│   ├── types.ts           # TypeScript types
│   └── constants.ts       # Reusable constants
├── lib/
│   └── OdooClient.ts      # Low-level API client
├── services/
│   └── partner.service.ts # Business logic for partners
├── context/
│   └── OdooContext.tsx     # Global Odoo state
├── hooks/
│   └── usePartners.ts      # Custom hook for partners
├── components/
│   └── Partner/
│       ├── PartnerCard.tsx # Single partner UI
│       ├── PartnerList.tsx # List of partners
│       └── PartnerForm.tsx # Create/edit partners
└── app/(tabs)/
    └── partners.tsx        # Partners screen
```

---

## **⚙️ Setup Instructions**

### **1. Install Dependencies**

```bash
npm install axios react-native react-native-paper @types/react @types/react-native
```

### **2. Configure Odoo**

Edit `config/odoo.config.ts` with your Odoo instance details:

```typescript
export const ODOO_CONFIG = {
  url: "YOUR_ODOO_URL",
  db: "YOUR_DB_NAME",
  username: "YOUR_USERNAME",
  password: "YOUR_PASSWORD",
};
```

### **3. Wrap Your App with `OdooProvider`**

Update `app/_layout.tsx`:

```tsx
import { OdooProvider } from "@/context/OdooContext";

export default function RootLayout() {
  return (
    <OdooProvider>
      <Stack />
    </OdooProvider>
  );
}
```

### **4. Run the App**

```bash
npx expo start
```

---

## **📝 Usage Examples**

### **1. Fetch Partners**

```tsx
import { usePartners } from "@/hooks/usePartners";

function PartnersScreen() {
  const { partners, isLoading, error } = usePartners({
    isCompany: true,
    limit: 10,
  });

  if (isLoading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error}</Text>;

  return <PartnerList partners={partners} />;
}
```

### **2. Create a Partner**

```tsx
import { useOdoo } from "@/context/OdooContext";
import { partnerService } from "@/services/partner.service";

function CreatePartnerScreen() {
  const { client } = useOdoo();

  const handleSubmit = async (data) => {
    await partnerService.createPartner(client, data);
  };

  return <PartnerForm onSubmit={handleSubmit} />;
}
```

---

## **🧪 Testing**

- **Unit Tests**: Test services and hooks in isolation.
- **Integration Tests**: Test data flow from API to UI.
- **Mock OdooClient**: Use `jest.mock` to simulate API responses.

Example:

```typescript
jest.mock("@/lib/OdooClient");
test("usePartners fetches data", async () => {
  const mockData = [{ id: 1, name: "Test Partner" }];
  OdooClient.mockResolvedValue(mockData);
  const { result } = renderHook(() => usePartners());
  expect(result.current.partners).toEqual(mockData);
});
```

---

## **🤝 Contributing**

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -m "Add your feature"`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a Pull Request.

---

## **📜 License**

MIT

---

This README provides a clear, structured overview of your project, making it easy for others (or your future self!) to understand, use, and contribute.
