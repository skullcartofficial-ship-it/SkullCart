import { CartItem } from "../cart";

// ─── Types ────────────────────────────────────────────────────────────────────

// FIX 1: Define Address shape here to match what address.tsx actually stores.
// The imported Address from ../types had a different shape, causing silent
// data mismatches at runtime.
export interface Address {
  id: number;
  createdAt: string;
  name: string;
  countryCode: string;
  phone: string;
  email: string;
  doorNo: string;
  street: string;
  city: string;
  pincode: string;
}

export interface UserData {
  email: string;
  cart: CartItem[];
  selectedAddressId?: string;
}

// ─── Storage helpers ──────────────────────────────────────────────────────────

// FIX 2: Guard all localStorage access — safe in tests and non-browser envs
const storage = {
  get(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string): boolean {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  },
  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      // no-op
    }
  },
};

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

// ─── Service ──────────────────────────────────────────────────────────────────

export class UserDataService {
  // ── Cart ────────────────────────────────────────────────────────────────────

  private cartKey(email: string): string {
    return `user_data_${email}`;
  }

  saveUserCart(email: string, cart: CartItem[]): void {
    if (!email) return;
    const existing = this.getUserData(email);
    const updated: UserData = { ...existing, email, cart };
    storage.set(this.cartKey(email), JSON.stringify(updated));
  }

  getUserCart(email: string): CartItem[] {
    return this.getUserData(email)?.cart ?? [];
  }

  getUserData(email: string): UserData | null {
    if (!email) return null;
    const raw = storage.get(this.cartKey(email));
    if (!raw) return null;
    try {
      return JSON.parse(raw) as UserData;
    } catch {
      console.error(`Corrupted user data for ${email} — clearing.`);
      storage.remove(this.cartKey(email));
      return null;
    }
  }

  // ── Addresses ───────────────────────────────────────────────────────────────

  // FIX 3: Addresses live under the shared "addresses" key as
  // Record<email, Address[]> — matching the format address.tsx uses.
  // The old service used user_data_${email}, so reads always returned [].

  private getAllAddresses(): Record<string, Address[]> {
    return safeParse<Record<string, Address[]>>(storage.get("addresses"), {});
  }

  getUserAddresses(email: string): Address[] {
    if (!email) return [];
    return this.getAllAddresses()[email] ?? [];
  }

  saveUserAddresses(
    email: string,
    addresses: Address[],
    selectedAddressId?: string
  ): boolean {
    if (!email) return false;

    const all = this.getAllAddresses();
    all[email] = addresses;
    const saved = storage.set("addresses", JSON.stringify(all));

    // Persist selected address ID separately
    if (saved && selectedAddressId !== undefined) {
      this.setSelectedAddressId(email, selectedAddressId);
    }

    return saved;
  }

  // ── Selected address ────────────────────────────────────────────────────────

  private selectedKey(email: string): string {
    return `selected_address_id_${email}`;
  }

  getSelectedAddressId(email: string): string | null {
    return storage.get(this.selectedKey(email));
  }

  setSelectedAddressId(email: string, id: string): void {
    storage.set(this.selectedKey(email), id);
  }

  clearSelectedAddressId(email: string): void {
    storage.remove(this.selectedKey(email));
  }

  // ── Account management ──────────────────────────────────────────────────────

  removeUserData(email: string): void {
    storage.remove(this.cartKey(email));
    storage.remove(this.selectedKey(email));

    // Also remove from shared addresses map
    const all = this.getAllAddresses();
    delete all[email];
    storage.set("addresses", JSON.stringify(all));
  }
}

export default new UserDataService();
