// services/partner.service.ts
// Purpose: All partner-related business logic in one place

import { ODOO_MODELS, PARTNER_FIELDS } from "@/config/constants";
import OdooClient from "@/utils/OdooClient";

import { Partner } from "../config/type";

export interface GetPartnersOptions {
  isCompany?: boolean;
  limit?: number;
  offset?: number;
  // accept readonly arrays (e.g. tuple constants) as well
  fields?: readonly string[];
}

export interface CreatePartnerData {
  name: string;
  email?: string;
  phone?: string;
  city?: string;
  is_company?: boolean;
}

export interface UpdatePartnerData {
  name?: string;
  email?: string;
  phone?: string;
  city?: string;
}

class PartnerService {
  /**
   * Get list of partners with optional filters
   */
  async getPartners(
    odoo: OdooClient,
    options: GetPartnersOptions = {}
  ): Promise<Partner[]> {
    const {
      isCompany,
      limit = 20,
      offset = 0,
      fields = PARTNER_FIELDS.BASIC,
    } = options;

    // Build domain (filters)
    const domain: any[] = [];
    if (isCompany !== undefined) {
      domain.push(["is_company", "=", isCompany]);
    }

    const partners = await odoo.searchRead(
      ODOO_MODELS.PARTNER,
      domain,
      // PARTNER_FIELDS.* may be readonly; cast to mutable string[] for the client API
      fields as unknown as string[],
      limit,
      offset
    );

    return partners;
  }

  /**
   * Get a single partner by ID
   */
  async getPartnerById(
    odoo: OdooClient,
    id: number,
    // accept readonly arrays here as well
    fields: readonly string[] = PARTNER_FIELDS.DETAILED
  ): Promise<Partner | null> {
    const partners = await odoo.read(
      ODOO_MODELS.PARTNER,
      [id],
      fields as unknown as string[]
    );
    return partners.length > 0 ? partners[0] : null;
  }

  /**
   * Search partners by name
   */
  async searchPartnersByName(
    odoo: OdooClient,
    searchTerm: string,
    limit: number = 10
  ): Promise<Partner[]> {
    const domain = [["name", "ilike", searchTerm]];

    const partners = await odoo.searchRead(
      ODOO_MODELS.PARTNER,
      domain,
      // cast readonly constant to string[] for the client call
      PARTNER_FIELDS.BASIC as unknown as string[],
      limit
    );

    return partners;
  }

  /**
   * Create a new partner
   */
  async createPartner(
    odoo: OdooClient,
    data: CreatePartnerData
  ): Promise<number> {
    const newId = await odoo.create(ODOO_MODELS.PARTNER, data);
    return newId;
  }

  /**
   * Update an existing partner
   */
  async updatePartner(
    odoo: OdooClient,
    id: number,
    data: UpdatePartnerData
  ): Promise<boolean> {
    const success = await odoo.write(ODOO_MODELS.PARTNER, [id], data);
    return success;
  }

  /**
   * Delete a partner
   */
  async deletePartner(odoo: OdooClient, id: number): Promise<boolean> {
    const success = await odoo.unlink(ODOO_MODELS.PARTNER, [id]);
    return success;
  }

  /**
   * Get companies only (is_company = true)
   */
  async getCompanies(odoo: OdooClient, limit: number = 20): Promise<Partner[]> {
    return this.getPartners(odoo, { isCompany: true, limit });
  }

  /**
   * Get individuals only (is_company = false)
   */
  async getIndividuals(
    odoo: OdooClient,
    limit: number = 20
  ): Promise<Partner[]> {
    return this.getPartners(odoo, { isCompany: false, limit });
  }
}

// Export a single instance (singleton pattern)
export const partnerService = new PartnerService();
