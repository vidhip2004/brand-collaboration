import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const paymentService = {
  // ==========================================
  // GET BRAND PAYMENTS & STATS
  // ==========================================
  async getBrandPayments(brandId) {
    if (!brandId) throw new Error("Brand ID is required");
    const response = await axios.get(
      `${API_BASE_URL}/payments/brand/${brandId}`
    );
    return response.data;
  },

  // ==========================================
  // GET CREATOR PAYMENTS & EARNINGS STATS
  // ==========================================
  async getCreatorPayments(creatorId) {
    if (!creatorId) throw new Error("Creator ID is required");
    const response = await axios.get(
      `${API_BASE_URL}/payments/creator/${creatorId}`
    );
    return response.data;
  },

  // ==========================================
  // GET SINGLE PAYMENT DETAILS
  // ==========================================
  async getPaymentById(paymentId) {
    if (!paymentId) throw new Error("Payment ID is required");
    const response = await axios.get(
      `${API_BASE_URL}/payments/${paymentId}`
    );
    return response.data;
  },

  // ==========================================
  // PROCESS PAYMENT (Pay Creator)
  // ==========================================
  async payCreator(paymentId, brandId, paymentMethod = "demo") {
    if (!paymentId) throw new Error("Payment ID is required");
    if (!brandId) throw new Error("Brand ID is required");

    const response = await axios.put(
      `${API_BASE_URL}/payments/${paymentId}/pay`,
      {
        brandId,
        paymentMethod,
      }
    );
    return response.data;
  },

  // ==========================================
  // GET TRANSACTION BY ID
  // ==========================================
  async getTransactionById(transactionId) {
    if (!transactionId) throw new Error("Transaction ID is required");
    const response = await axios.get(
      `${API_BASE_URL}/transactions/${transactionId}`
    );
    return response.data;
  },

  // ==========================================
  // GET BRAND TRANSACTIONS
  // ==========================================
  async getBrandTransactions(brandId) {
    if (!brandId) throw new Error("Brand ID is required");
    const response = await axios.get(
      `${API_BASE_URL}/transactions/brand/${brandId}`
    );
    return response.data;
  },

  // ==========================================
  // GET CREATOR TRANSACTIONS
  // ==========================================
  async getCreatorTransactions(creatorId) {
    if (!creatorId) throw new Error("Creator ID is required");
    const response = await axios.get(
      `${API_BASE_URL}/transactions/creator/${creatorId}`
    );
    return response.data;
  },
};

export default paymentService;
