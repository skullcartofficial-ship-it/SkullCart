// src/services/addressService.ts
export interface Address {
  id: string;
  fullName: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  isDefault?: boolean;
}

class AddressService {
  private getStorageKey(email: string): string {
    return `addresses_${email}`;
  }

  // Save addresses for specific user
  saveAddresses(email: string, addresses: Address[]): void {
    if (!email) return;
    const key = this.getStorageKey(email);
    localStorage.setItem(key, JSON.stringify(addresses));
    console.log(`💾 Addresses saved for ${email}:`, addresses.length);
  }

  // Get addresses for specific user
  getAddresses(email: string): Address[] {
    if (!email) return [];
    const key = this.getStorageKey(email);
    const addresses = JSON.parse(localStorage.getItem(key) || "[]");
    console.log(`📦 Addresses loaded for ${email}:`, addresses.length);
    return addresses;
  }

  // Add new address
  addAddress(email: string, address: Address): Address[] {
    const addresses = this.getAddresses(email);
    const newAddress = { ...address, id: address.id || Date.now().toString() };
    const updatedAddresses = [...addresses, newAddress];
    this.saveAddresses(email, updatedAddresses);
    return updatedAddresses;
  }

  // Update address
  updateAddress(
    email: string,
    addressId: string,
    updatedAddress: Partial<Address>
  ): Address[] {
    const addresses = this.getAddresses(email);
    const updatedAddresses = addresses.map((addr) =>
      addr.id === addressId ? { ...addr, ...updatedAddress } : addr
    );
    this.saveAddresses(email, updatedAddresses);
    return updatedAddresses;
  }

  // Delete address
  deleteAddress(email: string, addressId: string): Address[] {
    const addresses = this.getAddresses(email);
    const updatedAddresses = addresses.filter((addr) => addr.id !== addressId);
    this.saveAddresses(email, updatedAddresses);
    return updatedAddresses;
  }

  // Set default address
  setDefaultAddress(email: string, addressId: string): Address[] {
    const addresses = this.getAddresses(email);
    const updatedAddresses = addresses.map((addr) => ({
      ...addr,
      isDefault: addr.id === addressId,
    }));
    this.saveAddresses(email, updatedAddresses);
    return updatedAddresses;
  }

  // Get selected address ID
  getSelectedAddressId(email: string): string | null {
    if (!email) return null;
    const key = `selected_address_${email}`;
    return localStorage.getItem(key);
  }

  // Save selected address ID
  saveSelectedAddressId(email: string, addressId: string | null): void {
    if (!email) return;
    const key = `selected_address_${email}`;
    if (addressId) {
      localStorage.setItem(key, addressId);
    } else {
      localStorage.removeItem(key);
    }
  }

  // Clear all user address data (on logout)
  clearUserDataOnLogout(email: string): void {
    // Don't clear data on logout - keep it for next login
    console.log(`Address data preserved for ${email}`);
  }
}

export default new AddressService();
