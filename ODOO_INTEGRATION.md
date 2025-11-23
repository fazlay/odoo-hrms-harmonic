# Odoo Integration Guide

This guide explains how to add new routes to fetch or create data from Odoo using the existing JSON-RPC integration in this project.

## Architecture Overview

The project uses a layered architecture for Odoo integration:

1.  **`utils/OdooClient.ts`**: The low-level client that handles JSON-RPC communication, authentication, and basic CRUD operations (`searchRead`, `create`, `write`, `unlink`, etc.).
2.  **`services/*.service.ts`**: Service classes that encapsulate business logic and interact with specific Odoo models (e.g., `PartnerService`, `AttendanceService`).
3.  **`context/OdooContext.tsx`**: Provides the authenticated `OdooClient` instance to the React components.
4.  **`config/constants.ts`**: Defines Odoo model names and field lists.

## Step-by-Step Guide to Add a New Route

To add a new route (i.e., a new method to fetch or manipulate data), follow these steps:

### 1. Define Constants (Optional but Recommended)

If you are working with a new model or a new set of fields, add them to `config/constants.ts` (or create a new constants file if needed).

```typescript
// config/constants.ts

export const ODOO_MODELS = {
  // ... existing models
  MY_NEW_MODEL: "my.new.model",
};

export const MY_MODEL_FIELDS = {
  BASIC: ["id", "name", "state"],
  DETAILED: ["id", "name", "state", "description", "date_created"],
};
```

### 2. Create or Update a Service

If the new functionality relates to an existing service (e.g., Partners), add a method to that service. If it's a new domain, create a new service file in `services/`.

#### Example: Adding a method to an existing service

Open `services/partner.service.ts` and add a new method:

```typescript
// services/partner.service.ts

class PartnerService {
  // ... existing methods

  /**
   * Fetch partners by a specific category
   */
  async getPartnersByCategory(
    odoo: OdooClient,
    categoryId: number
  ): Promise<Partner[]> {
    const domain = [["category_id", "=", categoryId]];
    
    return odoo.searchRead(
      ODOO_MODELS.PARTNER,
      domain,
      ["id", "name", "email"], // Fields to fetch
      20 // Limit
    );
  }
}
```

#### Example: Creating a new service

Create `services/product.service.ts`:

```typescript
// services/product.service.ts

import { ODOO_MODELS } from "@/config/constants";
import OdooClient from "@/utils/OdooClient";

export interface Product {
  id: number;
  name: string;
  list_price: number;
}

class ProductService {
  
  async getProducts(odoo: OdooClient, limit: number = 10): Promise<Product[]> {
    return odoo.searchRead(
      "product.product", // Or use a constant
      [], // Empty domain = all records
      ["id", "name", "list_price"],
      limit
    );
  }

  async createProduct(odoo: OdooClient, name: string, price: number): Promise<number> {
    return odoo.create("product.product", {
      name: name,
      list_price: price,
    });
  }
}

export const productService = new ProductService();
```

### 3. Use the Service in a Component

Use the `useOdoo` hook to get the client instance and call the service method.

```tsx
// app/some-screen.tsx

import React, { useEffect, useState } from "react";
import { View, Text, Button } from "react-native";
import { useOdoo } from "@/context/OdooContext";
import { productService } from "@/services/product.service";

export default function ProductScreen() {
  const { client, isAuthenticated } = useOdoo();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (isAuthenticated && client) {
      loadProducts();
    }
  }, [isAuthenticated, client]);

  const loadProducts = async () => {
    if (!client) return;
    try {
      const data = await productService.getProducts(client);
      setProducts(data);
    } catch (error) {
      console.error("Failed to load products", error);
    }
  };

  return (
    <View>
      {products.map((p) => (
        <Text key={p.id}>{p.name} - ${p.list_price}</Text>
      ))}
    </View>
  );
}
```

## Common Odoo Methods

The `OdooClient` class exposes these core methods:

*   **`searchRead(model, domain, fields, limit, offset)`**: Search for records and return their fields. Most common method for fetching lists.
*   **`read(model, ids, fields)`**: Fetch fields for specific record IDs.
*   **`create(model, values)`**: Create a new record. Returns the new ID.
*   **`write(model, ids, values)`**: Update existing records.
*   **`unlink(model, ids)`**: Delete records.
*   **`call(model, method, args, kwargs)`**: Call any public method on an Odoo model.

## Tips

*   **Domains**: Odoo domains are arrays of tuples, e.g., `[["field", "operator", value]]`. Use `&` and `|` for complex logic (prefix notation).
*   **Fields**: Always specify the fields you need to reduce payload size.
*   **Error Handling**: Wrap service calls in `try/catch` blocks in your components to handle network errors or Odoo exceptions.
