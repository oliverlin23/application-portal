import checkoutNodeJssdk from '@paypal/checkout-server-sdk'

const clientId = process.env.PAYPAL_CLIENT_ID!
const clientSecret = process.env.PAYPAL_CLIENT_SECRET!
const environment = process.env.NODE_ENV === 'production'
  ? new checkoutNodeJssdk.core.LiveEnvironment(clientId, clientSecret)
  : new checkoutNodeJssdk.core.SandboxEnvironment(clientId, clientSecret)

const client = new checkoutNodeJssdk.core.PayPalHttpClient(environment)

export async function createPayPalInvoice(
  studentName: string,
  parentName: string,
  parentEmail: string,
  isUdlStudent: boolean
) {
  try {
    const request = new checkoutNodeJssdk.orders.OrdersCreateRequest()
    const total = isUdlStudent ? "299.00" : "599.00"

    request.prefer("return=representation")
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [{
        amount: {
          currency_code: "USD",
          value: total
        },
        description: `Yale Summer Debate Program 2024 - ${studentName}`,
        invoice_id: `YSDP-${Date.now()}`,
        custom_id: studentName,
        soft_descriptor: "YSDP 2024",
      }],
      payer: {
        email_address: parentEmail,
        name: {
          given_name: parentName.split(' ')[0],
          surname: parentName.split(' ').slice(1).join(' ')
        }
      },
      application_context: {
        brand_name: "Yale Summer Debate Program",
        landing_page: "NO_PREFERENCE",
        user_action: "PAY_NOW",
        return_url: `${process.env.NEXTAUTH_URL}/dashboard/payment/success`,
        cancel_url: `${process.env.NEXTAUTH_URL}/dashboard/payment/cancel`
      }
    })

    const order = await client.execute(request)
    
    return {
      id: order.result.id,
      status: order.result.status,
      links: order.result.links
    }
  } catch (error) {
    console.error('PayPal order creation error:', error)
    throw error
  }
}

export async function capturePayPalOrder(orderId: string) {
  try {
    const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(orderId)
    const capture = await client.execute(request)
    
    return {
      id: capture.result.id,
      status: capture.result.status,
      payer: capture.result.payer
    }
  } catch (error) {
    console.error('PayPal capture error:', error)
    throw error
  }
}
