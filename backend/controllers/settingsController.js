// Get payment gateway settings (public keys only)
const getPaymentGatewaySettings = async (req, res) => {
  try {
    const settings = {
      paystack: {
        enabled: !!process.env.PAYSTACK_SECRET_KEY,
        publicKey: process.env.PAYSTACK_PUBLIC_KEY || null,
      },
    };

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error fetching payment gateway settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payment gateway settings'
    });
  }
};

module.exports = {
  getPaymentGatewaySettings,
};
