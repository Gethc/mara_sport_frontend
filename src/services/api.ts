/**
 * API Service for Mara Sports Festival
 * Handles all backend communication
 */

// Old network configuration (commented out)
// const API_BASE_URL = 'http://192.168.1.45:8000/api/v1';

// Local backend configuration
const API_BASE_URL = 'http://localhost:8000/api/v1';

interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

class ApiService {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultHeaders: Record<string, string> = {};

    // Only set Content-Type for non-FormData requests
    if (!(options.body instanceof FormData)) {
      defaultHeaders['Content-Type'] = 'application/json';
    }

    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
      console.log('Adding auth token to request:', token.substring(0, 50) + '...');
    } else {
      console.log('No auth token found in localStorage');
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        // Surface server error details when available
        const serverMsg = (data && (data.detail || data.message || data.error)) as string | undefined;
        throw new Error(serverMsg || `HTTP error! status: ${response.status}`);
      }

      return {
        data,
        status: response.status,
      };
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication APIs
  async adminLogin(email: string, password: string) {
    return this.request('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async studentLogin(email: string, password: string) {
    return this.request('/auth/students/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async instituteLogin(email: string, password: string) {
    return this.request('/auth/institutes/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async sendOTP(email: string, role: string, purpose: string = 'login') {
    return this.request('/otp/send', {
      method: 'POST',
      body: JSON.stringify({ 
        email: email, 
        type: role,
        purpose: purpose
      }),
    });
  }

  async sendStudentOTP(email: string, name: string = 'Student', purpose: string = 'registration') {
    return this.request('/otp/send/student', {
      method: 'POST',
      body: JSON.stringify({ 
        email: email, 
        name: name,
        purpose: purpose
      }),
    });
  }

  async sendInstitutionOTP(email: string, name: string = 'Institution', purpose: string = 'registration') {
    return this.request('/otp/send/institution', {
      method: 'POST',
      body: JSON.stringify({ 
        email: email, 
        name: name,
        purpose: purpose
      }),
    });
  }

  async verifyOTP(otpId: string, otp: string) {
    return this.request('/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ 
        otp_id: otpId,
        code: otp 
      }),
    });
  }

  async verifyOTPWithEmail(email: string, otp: string) {
    return this.request('/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ 
        email: email,
        code: otp 
      }),
    });
  }

  // New simple email verification methods
  async sendEmailVerification(email: string, emailType: 'institution' | 'contact_person') {
    return this.request('/email-verification/send', {
      method: 'POST',
      body: JSON.stringify({
        email: email,
        email_type: emailType
      }),
    });
  }

  async verifyEmailVerification(email: string, otpCode: string, emailType: 'institution' | 'contact_person') {
    return this.request('/email-verification/verify', {
      method: 'POST',
      body: JSON.stringify({
        email: email,
        otp_code: otpCode,
        email_type: emailType
      }),
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  // Student APIs
  async getStudents(params?: { skip?: number; limit?: number }) {
    const query = params ? `?${new URLSearchParams(params as any)}` : '';
    return this.request(`/students${query}`);
  }

  async getStudent(id: number) {
    return this.request(`/students/${id}`);
  }

  async createStudent(studentData: any) {
    return this.request('/students', {
      method: 'POST',
      body: JSON.stringify(studentData),
    });
  }

  async createInstitutionStudent(studentData: any) {
    return this.request('/students/institution/students', {
      method: 'POST',
      body: JSON.stringify(studentData),
    });
  }

  async updateStudent(id: number, studentData: any) {
    return this.request(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(studentData),
    });
  }

  async updateInstitutionStudent(id: number, studentData: any) {
    return this.request(`/students/institution/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(studentData),
    });
  }

  async deleteStudent(id: number) {
    return this.request(`/students/${id}`, {
      method: 'DELETE',
    });
  }

  // Student medical information
  async getStudentMedicalInfo(studentId: number) {
    return this.request(`/students/${studentId}/medical-info`);
  }

  async updateStudentMedicalInfo(studentId: number, medicalData: any) {
    return this.request(`/students/${studentId}/medical-info`, {
      method: 'PUT',
      body: JSON.stringify(medicalData),
    });
  }

  // Student health information
  async getStudentHealthInfo(studentId: number) {
    return this.request(`/students/${studentId}/health-info`);
  }

  async updateStudentHealthInfo(studentId: number, healthData: any) {
    return this.request(`/students/${studentId}/health-info`, {
      method: 'PUT',
      body: JSON.stringify(healthData),
    });
  }

  // Parent information
  async getParentInfo(studentId: number) {
    return this.request(`/students/${studentId}/parents`);
  }

  async updateParentInfo(studentId: number, parentData: any) {
    return this.request(`/students/${studentId}/parents`, {
      method: 'PUT',
      body: JSON.stringify(parentData),
    });
  }

  // Institution APIs (renamed to match database table)
  async getInstitutes(params?: { skip?: number; limit?: number }) {
    const query = params ? `?${new URLSearchParams(params as any)}` : '';
    return this.request(`/institutes${query}`);
  }

  async getInstitute(id: number) {
    return this.request(`/institutes/${id}`);
  }

  async createInstitute(instituteData: any) {
    return this.request('/institutes', {
      method: 'POST',
      body: JSON.stringify(instituteData),
    });
  }

  async getInstituteByEmail(email: string) {
    return this.request(`/institutes/by-email/${encodeURIComponent(email)}`);
  }

  async updateInstitute(id: number, instituteData: any) {
    return this.request(`/institutes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(instituteData),
    });
  }

  async deleteInstitute(id: number) {
    return this.request(`/institutes/${id}`, {
      method: 'DELETE',
    });
  }

  // Institute contact persons
  async getContactPersons(instituteId: number) {
    return this.request(`/institutes/${instituteId}/contact-persons`);
  }

  async updateContactPerson(instituteId: number, contactData: any) {
    return this.request(`/institutes/${instituteId}/contact-persons`, {
      method: 'PUT',
      body: JSON.stringify(contactData),
    });
  }

  // Institute information
  async getInstituteInformation(instituteId: number) {
    return this.request(`/institutes/${instituteId}/information`);
  }

  async updateInstituteInformation(instituteId: number, infoData: any) {
    return this.request(`/institutes/${instituteId}/information`, {
      method: 'PUT',
      body: JSON.stringify(infoData),
    });
  }

  // Sports APIs
  async getSports(params?: { skip?: number; limit?: number }) {
    const query = params ? `?${new URLSearchParams(params as any)}` : '';
    return this.request(`/sports${query}`);
  }

  async getSport(id: number) {
    return this.request(`/sports/${id}`);
  }

  async createSport(sportData: any) {
    return this.request('/sports', {
      method: 'POST',
      body: JSON.stringify(sportData),
    });
  }

  async updateSport(id: number, sportData: any) {
    return this.request(`/sports/${id}`, {
      method: 'PUT',
      body: JSON.stringify(sportData),
    });
  }

  async deleteSport(id: number) {
    return this.request(`/sports/${id}`, {
      method: 'DELETE',
    });
  }

  // Categories APIs
  async getSportCategories(sportId: number) {
    return this.request(`/sports/${sportId}/categories`);
  }

  async getCategories() {
    return this.request('/categories');
  }

  async createCategory(categoryData: any) {
    return this.request('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  }

  async updateCategory(id: number, categoryData: any) {
    return this.request(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    });
  }

  // Sub-categories APIs
  async getSubCategories(categoryId: number) {
    return this.request(`/categories/${categoryId}/subcategories`);
  }

  async createSubCategory(subCategoryData: any) {
    return this.request('/subcategories', {
      method: 'POST',
      body: JSON.stringify(subCategoryData),
    });
  }

  async updateSubCategory(id: number, subCategoryData: any) {
    return this.request(`/subcategories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(subCategoryData),
    });
  }
  // Sport Assignment APIs (replaces registrations in new schema)
  async createSportAssignment(assignmentData: any) {
    return this.request('/sport-assignments', {
      method: 'POST',
      body: JSON.stringify(assignmentData),
    });
  }

  async getSportAssignments(params?: { skip?: number; limit?: number; institute_id?: number; student_id?: number }) {
    const query = params ? `?${new URLSearchParams(params as any)}` : '';
    return this.request(`/sport-assignments${query}`);
  }

  async updateSportAssignment(id: number, assignmentData: any) {
    return this.request(`/sport-assignments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(assignmentData),
    });
  }

  async deleteSportAssignment(id: number) {
    return this.request(`/sport-assignments/${id}`, {
      method: 'DELETE',
    });
  }

  async getStudentSportAssignments(studentId: number) {
    return this.request(`/students/${studentId}/sport-assignments`);
  }

  async getInstituteSportAssignments(instituteId: number) {
    return this.request(`/institutes/${instituteId}/sport-assignments`);
  }

  // Payment APIs
  async createPayment(paymentData: any) {
    return this.request('/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  async getPayments(params?: { skip?: number; limit?: number }) {
    const query = params ? `?${new URLSearchParams(params as any)}` : '';
    return this.request(`/payments${query}`);
  }

  // Sponsorship APIs
  async createSponsorship(sponsorshipData: any) {
    return this.request('/sponsorships', {
      method: 'POST',
      body: JSON.stringify(sponsorshipData),
    });
  }

  async getSponsorships(params?: { skip?: number; limit?: number }) {
    const query = params ? `?${new URLSearchParams(params as any)}` : '';
    return this.request(`/sponsorships${query}`);
  }

  // Dashboard APIs
  async getDashboardStats() {
    return this.request('/dashboard/stats');
  }

  // Health check
  async healthCheck() {
    return this.request('/healthz');
  }

  // --- Admin Dashboard Endpoints ---
  async getAdminDashboardStats() {
    return this.request('/admin/dashboard/stats');
  }

  async getAdminInstitutions(params?: { search?: string; institution_type?: string; payment_status?: string; skip?: number; limit?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.institution_type) queryParams.append('institution_type', params.institution_type);
    if (params?.payment_status) queryParams.append('payment_status', params.payment_status);
    if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
    
    const queryString = queryParams.toString();
    return this.request(`/admin/institutions${queryString ? `?${queryString}` : ''}`);
  }

  async getAdminInstitutionTypes() {
    return this.request('/admin/institution-types');
  }

  async getInstitutionDetails(institutionId: number) {
    return this.request(`/admin/institutions/${institutionId}`);
  }

  async getAdminStudents(params?: { search?: string; institution_type?: string; payment_status?: string; skip?: number; limit?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.institution_type) queryParams.append('institution_type', params.institution_type);
    if (params?.payment_status) queryParams.append('payment_status', params.payment_status);
    if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
    
    const queryString = queryParams.toString();
    return this.request(`/admin/students${queryString ? `?${queryString}` : ''}`);
  }

  async getAdminPayments(params?: { 
    status_filter?: string; 
    type_filter?: string; 
    search?: string; 
    page?: number; 
    limit?: number; 
    sort_by?: string; 
    sort_order?: string; 
  }) {
    const queryParams = new URLSearchParams();
    if (params?.status_filter) queryParams.append('status_filter', params.status_filter);
    if (params?.type_filter) queryParams.append('type_filter', params.type_filter);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by);
    if (params?.sort_order) queryParams.append('sort_order', params.sort_order);
    
    const queryString = queryParams.toString();
    return this.request(`/admin/payments${queryString ? `?${queryString}` : ''}`);
  }

  async getPaymentsSummary() {
    return this.request('/admin/payments/summary');
  }

  async getPaymentDetails(paymentType: string, paymentId: number) {
    return this.request(`/admin/payments/${paymentType}/${paymentId}`);
  }


  async getAdminInvoices(params?: { search?: string; status?: string; institution?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.institution) queryParams.append('institution', params.institution);
    
    const queryString = queryParams.toString();
    return this.request(`/admin/invoices${queryString ? `?${queryString}` : ''}`);
  }

  // Institution-specific API methods
  async getInstitutionStudents(params?: { search?: string; payment_status?: string; skip?: number; limit?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.payment_status) queryParams.append('payment_status', params.payment_status);
    if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
    
    const queryString = queryParams.toString();
    return this.request(`/institution/students${queryString ? `?${queryString}` : ''}`);
  }

  async getInstitutionPayments(params?: { search?: string; status?: string; skip?: number; limit?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
    
    const queryString = queryParams.toString();
    return this.request(`/institution/payments${queryString ? `?${queryString}` : ''}`);
  }

  async getInstitutionSponsorships() {
    return this.request('/institution/sponsorships');
  }

  async getInstitutionStats() {
    return this.request('/institution/stats');
  }

  async getInstitutionSports(params?: { skip?: number; limit?: number; sport_type?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
    if (params?.sport_type) queryParams.append('sport_type', params.sport_type);
    
    const queryString = queryParams.toString();
    return this.request(`/institution/sports${queryString ? `?${queryString}` : ''}`);
  }

  async getAvailableSports() {
    return this.request('/institution/sports/available');
  }

  async getAdminSports(params?: { skip?: number; limit?: number }) {
    console.log('🔍 getAdminSports called with params:', params);
    const queryParams = new URLSearchParams();
    if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
    
    const queryString = queryParams.toString();
    const result = await this.request(`/admin/sports${queryString ? `?${queryString}` : ''}`);
    console.log('🔍 getAdminSports result:', result);
    return result;
  }


  async addSubCategory(sportId: string, subCategoryData: any) {
    return this.request(`/sports/${sportId}/subcategories`, {
      method: 'POST',
      body: JSON.stringify(subCategoryData)
    });
  }


  async deleteSubCategory(subCategoryId: string) {
    return this.request(`/subcategories/${subCategoryId}`, {
      method: 'DELETE'
    });
  }

  async getAdminSponsorships() {
    return this.request('/admin/sponsorships');
  }

  // --- Student Registration Methods ---
  async registerStudent(studentData: any): Promise<ApiResponse<any>> {
    return this.request('/students/register', {
      method: 'POST',
      body: JSON.stringify(studentData)
    });
  }

  async getStudentByUserId(userId: string): Promise<ApiResponse<any>> {
    return this.request(`/students/user/${userId}`);
  }

  // Student Sports Management APIs
  async addStudentSports(studentId: string, sportsData: any[]) {
    return this.request(`/students/${studentId}/sports`, {
      method: 'POST',
      body: JSON.stringify({ selectedSports: sportsData }),
    });
  }

  async updateStudentSports(studentId: string, sportsData: any[]) {
    return this.request(`/students/${studentId}/sports`, {
      method: 'PUT',
      body: JSON.stringify({ selectedSports: sportsData }),
    });
  }

  async removeStudentSports(studentId: string, sportIds: string[]) {
    return this.request(`/students/${studentId}/sports`, {
      method: 'DELETE',
      body: JSON.stringify({ sportIds }),
    });
  }

  async getStudentSports(studentId: string) {
    return this.request(`/students/${studentId}/sports`);
  }

  async removeStudentFromSport(studentId: number, sportId: string) {
    return this.request(`/students/${studentId}/sports/${sportId}`, {
      method: 'DELETE',
    });
  }

  async removeStudentFromCategory(studentId: number, categoryId: string) {
    return this.request(`/students/${studentId}/categories/${categoryId}`, {
      method: 'DELETE',
    });
  }

  async getStudentsBySport(sportId: string) {
    return this.request(`/sports/${sportId}/students`);
  }

  // Institution Sports Management APIs

  async addSportCategory(sportId: string, data: any) {
    return this.request(`/sports/${sportId}/categories`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async addSportSubCategory(categoryId: string, data: any) {
    return this.request(`/categories/${categoryId}/subcategories`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteSportCategory(categoryId: string) {
    return this.request(`/categories/${categoryId}`, {
      method: 'DELETE',
    });
  }

  async deleteSportSubCategory(subCategoryId: string) {
    return this.request(`/subcategories/${subCategoryId}`, {
      method: 'DELETE',
    });
  }

  async assignStudentsToSport(sportId: string, data: any) {
    return this.request(`/sports/${sportId}/assign-students`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Sponsor APIs
  async getSponsors() {
    return this.request('/sponsors');
  }

  async createSponsor(sponsorData: any) {
    return this.request('/sponsors', {
      method: 'POST',
      body: JSON.stringify(sponsorData),
    });
  }

  async updateSponsor(id: number, sponsorData: any) {
    return this.request(`/sponsors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(sponsorData),
    });
  }

  async deleteSponsor(id: number) {
    return this.request(`/sponsors/${id}`, {
      method: 'DELETE',
    });
  }

  // Institute Sponsorship APIs
  async getInstituteSponsorships(instituteId?: number) {
    const query = instituteId ? `?institute_id=${instituteId}` : '';
    return this.request(`/sponsorships${query}`);
  }

  async createInstituteSponsorship(sponsorshipData: any) {
    return this.request('/sponsorships', {
      method: 'POST',
      body: JSON.stringify(sponsorshipData),
    });
  }

  async updateInstituteSponsorship(id: number, sponsorshipData: any) {
    return this.request(`/sponsorships/${id}`, {
      method: 'PUT',
      body: JSON.stringify(sponsorshipData),
    });
  }

  // Sponsor alignment with institutes
  async getSponsorAlignments() {
    return this.request('/sponsor-alignments');
  }

  async createSponsorAlignment(alignmentData: any) {
    return this.request('/sponsor-alignments', {
      method: 'POST',
      body: JSON.stringify(alignmentData),
    });
  }

  // Fees APIs
  async getFees(sportId?: number) {
    const query = sportId ? `?sport_id=${sportId}` : '';
    return this.request(`/fees${query}`);
  }

  async createFee(feeData: any) {
    return this.request('/fees', {
      method: 'POST',
      body: JSON.stringify(feeData),
    });
  }

  async updateFee(id: number, feeData: any) {
    return this.request(`/fees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(feeData),
    });
  }

  // Sport Info APIs (sport details with fees and limits)
  async getSportInfo(sportId?: number) {
    const query = sportId ? `?sport_id=${sportId}` : '';
    return this.request(`/sport-info${query}`);
  }

  async createSportInfo(sportInfoData: any) {
    return this.request('/sport-info', {
      method: 'POST',
      body: JSON.stringify(sportInfoData),
    });
  }

  async updateSportInfo(id: number, sportInfoData: any) {
    return this.request(`/sport-info/${id}`, {
      method: 'PUT',
      body: JSON.stringify(sportInfoData),
    });
  }



  async assignStudentSports(studentId: number, data: any) {
    return this.request(`/students/${studentId}/sports`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Registration Progress APIs
  async saveStudentRegistrationProgress(data: any) {
    return this.request('/registration/student/progress', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getStudentRegistrationProgress(email: string) {
    return this.request(`/registration/student/progress/${email}`, {
      method: 'GET',
    });
  }

  async getCompleteStudentData(email: string) {
    return this.request(`/students/complete-data/${email}`, {
      method: 'GET',
    });
  }

  async deleteStudentRegistrationProgress(email: string) {
    return this.request(`/registration/student/progress/${email}`, {
      method: 'DELETE',
    });
  }

  async saveInstitutionRegistrationProgress(data: any) {
    return this.request('/registration/institution/progress', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getInstitutionRegistrationProgress(email: string) {
    return this.request(`/registration/institution/progress/${email}`, {
      method: 'GET',
    });
  }

  async deleteInstitutionRegistrationProgress(email: string) {
    return this.request(`/registration/institution/progress/${email}`, {
      method: 'DELETE',
    });
  }

  // Student Registration APIs
  async savePersonalDetails(personalData: any) {
    return this.request('/students/personal-details', {
      method: 'POST',
      body: JSON.stringify(personalData),
    });
  }

  async saveDocuments(documentData: any) {
    return this.request('/students/documents', {
      method: 'POST',
      body: JSON.stringify(documentData),
    });
  }

  async saveParentMedical(parentMedicalData: any) {
    return this.request('/students/parent-medical', {
      method: 'POST',
      body: JSON.stringify(parentMedicalData),
    });
  }

  async saveSportsSelection(sportsData: any) {
    return this.request('/students/sports-selection', {
      method: 'POST',
      body: JSON.stringify(sportsData),
    });
  }

  async saveSportAssignments(assignmentData: any) {
    return this.request('/sports/sport-assignments', {
      method: 'POST',
      body: JSON.stringify(assignmentData),
    });
  }

  async completeRegistration(completionData: any) {
    return this.request('/students/complete-registration', {
      method: 'POST',
      body: JSON.stringify(completionData),
    });
  }

  async createPaymentRequest(paymentData: any) {
    return this.request('/students/payment-request', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  // Public APIs
  async getInstituteTypes() {
    return this.request('/public/institute-types');
  }

  async getInstitutesPublic(instituteType?: string) {
    const params = instituteType ? `?institute_type=${instituteType}` : '';
    return this.request(`/public/institutes${params}`);
  }

  async getSportsPublic(sportType?: string) {
    const params = sportType ? `?sport_type=${sportType}` : '';
    return this.request(`/public/sports${params}`);
  }

  async getSportCategoriesPublic(sportId: number) {
    return this.request(`/public/sports/${sportId}/categories`);
  }

  async getSubCategoriesPublic(sportId: number, categoryId: number) {
    return this.request(`/public/sports/${sportId}/categories/${categoryId}/sub-categories`);
  }

  // Alias for getSubCategoriesPublic to match the expected method name
  async getSubCategoriesBySport(sportId: number, categoryId: number) {
    return this.getSubCategoriesPublic(sportId, categoryId);
  }

  // Document Upload APIs
  async uploadDocuments(email: string, studentIdImage?: File, ageProofDocument?: File) {
    const formData = new FormData();
    formData.append('email', email);
    if (studentIdImage) formData.append('student_id_image', studentIdImage);
    if (ageProofDocument) formData.append('age_proof_document', ageProofDocument);
    
    return this.request('/documents/upload-documents', {
      method: 'POST',
      body: formData,
    });
  }


  async getStudentDocuments(studentId: number) {
    return this.request(`/documents/${studentId}`);
  }

  async downloadDocument(studentId: number, documentType: 'id_proof' | 'age_proof') {
    return this.request(`/documents/${studentId}/download/${documentType}`, {
      method: 'GET',
    });
  }

  // Fee Management APIs
  async getFeeRules(sportId?: number, disciplineCount?: number) {
    const params = new URLSearchParams();
    if (sportId) params.append('sport_id', sportId.toString());
    if (disciplineCount !== undefined) params.append('discipline_count', disciplineCount.toString());
    
    return this.request(`/fees/fee-rules?${params.toString()}`);
  }

  async getFeeRulesBySport(sportId: number) {
    return this.request(`/fees/fee-rules/sport/${sportId}`);
  }

  async createFeeRule(sportId: number, disciplineCount: number, fee: number) {
    return this.request('/fees/fee-rules', {
      method: 'POST',
      body: JSON.stringify({ sportId, disciplineCount, fee }),
    });
  }

  async updateFeeRule(ruleId: number, fee: number) {
    return this.request(`/fees/fee-rules/${ruleId}`, {
      method: 'PUT',
      body: JSON.stringify({ fee }),
    });
  }

  async deleteFeeRule(ruleId: number) {
    return this.request(`/fees/fee-rules/${ruleId}`, {
      method: 'DELETE',
    });
  }

  async calculateFee(sportId: number, disciplineCount: number) {
    return this.request(`/fees/calculate-fee?sport_id=${sportId}&discipline_count=${disciplineCount}`);
  }

  // Parent Pass APIs
  async getParentPasses(category?: number, passType?: string) {
    const params = new URLSearchParams();
    if (category !== undefined) params.append('category', category.toString());
    if (passType) params.append('pass_type', passType);
    
    return this.request(`/parent-passes?${params.toString()}`);
  }

  async getParentPassesByCategory(category: number) {
    return this.request(`/parent-passes/category/${category}`);
  }

  async getCurrentPricing(category: number) {
    return this.request(`/parent-passes/current-pricing?category=${category}`);
  }

  async createParentPass(category: number, amount: number, passType: string, passDate: string) {
    return this.request('/parent-passes', {
      method: 'POST',
      body: JSON.stringify({ category, amount, passType, passDate }),
    });
  }

  async updateParentPass(passId: number, data: { amount?: number; passType?: string; passDate?: string }) {
    return this.request(`/parent-passes/${passId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteParentPass(passId: number) {
    return this.request(`/parent-passes/${passId}`, {
      method: 'DELETE',
    });
  }

  async getPricingSummary() {
    return this.request('/parent-passes/pricing-summary');
  }

  // Age groups are now generated from sport data in frontend

  async getGenderOptions() {
    return this.request('/public/gender-options');
  }

  // Fee Calculation API
  async calculateTotalFees(data: {
    selectedSports: { sport_id: number }[];
    parentCount: number;
    parentAges?: number[];
  }) {
    return this.request('/fee-calculation/calculate-total-fees', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // OTP Management Methods (Development Only)
  async clearOTPForEmail(email: string) {
    return this.request('/otp/clear', {
      method: 'POST',
      body: JSON.stringify({ email: email }),
    });
  }

  async clearAllOTPs() {
    return this.request('/otp/clear-all', {
      method: 'POST',
    });
  }

  // Institution Registration Checkpoint Methods
  async saveRegistrationCheckpoint(email: string, step: number, data: any) {
    return this.request('/checkpoint/save', {
      method: 'POST',
      body: JSON.stringify({
        email,
        step,
        data
      }),
    });
  }

  async loadRegistrationCheckpoint(email: string) {
    return this.request(`/checkpoint/load/${email}`);
  }

  async createSponsorshipRequest(sponsorshipData: any) {
    return this.request('/payment/institute/sponsorship-request', {
      method: 'POST',
      body: JSON.stringify(sponsorshipData),
    });
  }

  async createStudentPaymentRequests(studentPaymentData: any) {
    return this.request('/payment/institute/student-payment-requests', {
      method: 'POST',
      body: JSON.stringify(studentPaymentData),
    });
  }

  async createStudentsFromInstitution(studentsData: any) {
    return this.request('/payment/students/create-from-institution', {
      method: 'POST',
      body: JSON.stringify(studentsData),
    });
  }

  async calculateInstitutionFees(feeData: any) {
    return this.request('/fee-calculation/calculate-institution-fees', {
      method: 'POST',
      body: JSON.stringify(feeData),
    });
  }

  async clearRegistrationCheckpoint(email: string) {
    return this.request(`/checkpoint/clear/${email}`, {
      method: 'DELETE',
    });
  }

  // Student Dashboard Methods
  async getStudentDashboard() {
    return this.request('/students/dashboard');
  }

  async getStudentRegistrations() {
    return this.request('/students/dashboard');
  }

  async getStudentPaymentInfo(studentId: number) {
    return this.request(`/students/public/${studentId}/payment-info`);
  }

  async getStudentProfile() {
    return this.request('/auth/me/student');
  }

  // Payment methods
  async processStudentPayment(studentId: number, paymentData: any) {
    return this.request(`/payments/institution/students/${studentId}/payment`, {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  async sendPaymentLinkToStudent(studentId: number, emailData: any) {
    return this.request(`/payments/institution/students/${studentId}/send-payment-link`, {
      method: 'POST',
      body: JSON.stringify(emailData),
    });
  }

  async getStudentPaymentStatus(studentId: number) {
    return this.request(`/payments/institution/students/${studentId}/payment-status`);
  }

  // Student login methods
  async sendStudentLoginOTP(data: { email: string }) {
    return this.request('/otp/send/student', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Institution profile methods
  async getInstitutionProfile() {
    return this.request('/auth/me/institute');
  }

  async updateInstitutionProfile(profileData: any) {
    return this.request('/institutes/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }
}

// Create and export a singleton instance
export const apiService = new ApiService();
export default apiService;
