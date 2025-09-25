// Real-time data synchronization across admin modules
export interface Institution {
  id: number;
  name: string;
  email: string;
  type?: string;
  
  // Contact person information (from contact_persons table)
  contactPerson?: string;
  contactPersonName?: string;
  contactPersonDesignation?: string;
  contactPersonPhone?: number;
  contactPersonEmail?: string;
  
  // Institute information (from institute_information table)
  phoneNumber?: number;
  website?: string;
  principalName?: string;
  principalPhoneNumber?: number;
  
  // Computed/legacy fields for compatibility
  paymentStatus?: "Paid" | "Partial" | "Pending";
  totalAmount?: number;
  paidAmount?: number;
  lastPayment?: string;
  invoiceId?: string;
  sponsorshipStatus?: "Not Applied" | "Applied" | "Approved" | "Rejected";
  sponsorshipReason?: string;
  sponsorName?: string;
  sponsoredAmount?: number;
  registrationDate?: string;
  sports?: string[];
}

export interface SponsorshipRequest {
  id: number;
  institution: string;
  type: "Full" | "Partial";
  requestedAmount: number;
  status: "Pending" | "Approved" | "Rejected";
  sponsor: string;
  contactPerson: string;
  email: string;
  reason: string;
  dateApplied: string;
  sponsoredAmount: number;
}

// Global data store for cross-module sync
class AdminDataStore {
  private institutions: Institution[] = [];
  private sponsorshipRequests: SponsorshipRequest[] = [];
  private listeners: (() => void)[] = [];

  // Subscribe to data changes
  subscribe(callback: () => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  // Notify all listeners of data changes
  private notify() {
    this.listeners.forEach(listener => listener());
  }

  // Update sponsorship status and sync payment status
  updateSponsorshipStatus(
    institutionId: number, 
    status: "Approved" | "Rejected",
    sponsorData?: {
      sponsorName: string;
      sponsorEmail: string;
      sponsoredAmount: number;
    }
  ) {
    // Update institution data
    const institution = this.institutions.find(inst => inst.id === institutionId);
    if (institution) {
      institution.sponsorshipStatus = status;
      
      if (status === "Approved" && sponsorData) {
        institution.sponsorName = sponsorData.sponsorName;
        institution.sponsoredAmount = sponsorData.sponsoredAmount;
        // Auto-update payment status when sponsorship is approved
        institution.paymentStatus = "Paid";
        institution.paidAmount = institution.totalAmount;
        institution.lastPayment = new Date().toISOString().split('T')[0];
      }
    }

    // Update sponsorship request data
    const sponsorshipRequest = this.sponsorshipRequests.find(req => req.id === institutionId);
    if (sponsorshipRequest) {
      sponsorshipRequest.status = status;
      if (status === "Approved" && sponsorData) {
        sponsorshipRequest.sponsor = sponsorData.sponsorName;
        sponsorshipRequest.sponsoredAmount = sponsorData.sponsoredAmount;
      }
    }

    this.notify();
  }

  // Update payment status
  updatePaymentStatus(institutionId: number, paymentStatus: "Paid" | "Partial" | "Pending", paidAmount: number) {
    const institution = this.institutions.find(inst => inst.id === institutionId);
    if (institution) {
      institution.paymentStatus = paymentStatus;
      institution.paidAmount = paidAmount;
      institution.lastPayment = new Date().toISOString().split('T')[0];
      this.notify();
    }
  }

  // Get all institutions
  getInstitutions() {
    return this.institutions;
  }

  // Get all sponsorship requests
  getSponsorshipRequests() {
    return this.sponsorshipRequests;
  }

  // Set initial data
  setInstitutions(institutions: Institution[]) {
    this.institutions = institutions;
    this.notify();
  }

  setSponsorshipRequests(requests: SponsorshipRequest[]) {
    this.sponsorshipRequests = requests;
    this.notify();
  }
}

// Global instance
export const adminDataStore = new AdminDataStore();

// Export functions for different data formats
export const exportToCSV = (data: any[], filename: string) => {
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(row => 
    Object.values(row).map(value => 
      typeof value === 'string' && value.includes(',') ? `"${value}"` : value
    ).join(',')
  );
  
  const csvContent = [headers, ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  
  window.URL.revokeObjectURL(url);
};

export const exportToExcel = (data: any[], filename: string) => {
  // For a full implementation, you would use libraries like xlsx
  // For now, we'll use CSV format as a fallback
  exportToCSV(data, filename);
};

export const exportToPDF = (data: any[], filename: string) => {
  // For a full implementation, you would use libraries like jsPDF
  // For now, we'll create a simple HTML table that can be printed as PDF
  const htmlContent = `
    <html>
      <head>
        <title>${filename}</title>
        <style>
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <h1>${filename}</h1>
        <table>
          <thead>
            <tr>
              ${Object.keys(data[0] || {}).map(key => `<th>${key}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${data.map(row => 
              `<tr>${Object.values(row).map(value => `<td>${value}</td>`).join('')}</tr>`
            ).join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;
  
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  }
};