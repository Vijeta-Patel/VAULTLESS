// ============================================================
// FILE: src/lib/duressAlert.js
// ============================================================
import emailjs from '@emailjs/browser'

export async function sendDuressAlert({ walletAddress, timestamp, etherscanLink }) {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY
  const alertEmail = import.meta.env.VITE_ALERT_EMAIL

  if (!serviceId || !templateId || !publicKey || serviceId === 'your_service_id') {
    console.warn('[VAULTLESS] EmailJS not configured — duress alert skipped in demo mode')
    console.log('[VAULTLESS] DURESS ALERT WOULD SEND:', {
      to: alertEmail,
      wallet: walletAddress,
      timestamp: new Date(timestamp).toISOString(),
      etherscanLink,
    })
    return { status: 'demo', message: 'EmailJS not configured' }
  }

  try {
    const templateParams = {
      to_email: alertEmail,
      wallet_address: walletAddress || 'Unknown',
      timestamp: new Date(timestamp).toISOString(),
      etherscan_link: etherscanLink || 'N/A',
      message: `VAULTLESS DURESS ALERT: Coercion attack detected at ${new Date(timestamp).toLocaleString()}. Wallet: ${walletAddress}. Account has been locked. View on Etherscan: ${etherscanLink}`,
    }

    const result = await emailjs.send(serviceId, templateId, templateParams, publicKey)
    console.log('[VAULTLESS] Duress alert sent successfully:', result.status, result.text)
    return result
  } catch (error) {
    console.error('[VAULTLESS] Duress alert failed:', error)
    throw error
  }
}
