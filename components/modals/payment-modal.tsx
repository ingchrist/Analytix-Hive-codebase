"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { CreditCard, Shield, CheckCircle, Lock, Smartphone, Wallet } from "lucide-react"

interface PaymentItem {
  id: string
  name: string
  price: number
  type: "course" | "subscription" | "certificate"
}

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  items: PaymentItem[]
  total: number
}

interface PaymentMethod {
  id: string
  type: "card" | "paypal" | "apple" | "google"
  label: string
  icon: any
  description: string
}

interface BillingInfo {
  firstName: string
  lastName: string
  email: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
}

interface CardInfo {
  number: string
  expiry: string
  cvv: string
  name: string
}

export default function PaymentModal({ isOpen, onClose, items, total }: PaymentModalProps) {
  const [currentStep, setCurrentStep] = useState<"method" | "details" | "review" | "processing" | "success">("method")
  const [selectedMethod, setSelectedMethod] = useState<string>("card")
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [savePaymentMethod, setSavePaymentMethod] = useState(false)
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [promoCode, setPromoCode] = useState("")
  const [discount, setDiscount] = useState(0)

  const [billingInfo, setBillingInfo] = useState<BillingInfo>({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "US",
  })

  const [cardInfo, setCardInfo] = useState<CardInfo>({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
  })

  const paymentMethods: PaymentMethod[] = [
    {
      id: "card",
      type: "card",
      label: "Credit/Debit Card",
      icon: CreditCard,
      description: "Visa, Mastercard, American Express",
    },
    {
      id: "paypal",
      type: "paypal",
      label: "PayPal",
      icon: Wallet,
      description: "Pay with your PayPal account",
    },
    {
      id: "apple",
      type: "apple",
      label: "Apple Pay",
      icon: Smartphone,
      description: "Touch ID or Face ID",
    },
    {
      id: "google",
      type: "google",
      label: "Google Pay",
      icon: Smartphone,
      description: "Pay with Google",
    },
  ]

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ""
    const parts = []

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }

    if (parts.length) {
      return parts.join(" ")
    } else {
      return v
    }
  }

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`
    }
    return v
  }

  const validateStep = () => {
    switch (currentStep) {
      case "method":
        return selectedMethod !== ""
      case "details":
        if (selectedMethod === "card") {
          return (
            cardInfo.number.replace(/\s/g, "").length >= 13 &&
            cardInfo.expiry.length === 5 &&
            cardInfo.cvv.length >= 3 &&
            cardInfo.name.trim() !== "" &&
            billingInfo.firstName.trim() !== "" &&
            billingInfo.lastName.trim() !== "" &&
            billingInfo.email.trim() !== ""
          )
        }
        return true
      case "review":
        return agreeToTerms
      default:
        return true
    }
  }

  const nextStep = () => {
    if (!validateStep()) {
      toast( "Please complete all required fields",
        {description: "Fill in all the required information to continue",

      })
      return
    }

    const steps = ["method", "details", "review", "processing", "success"]
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1] as any)
    }
  }

  const prevStep = () => {
    const steps = ["method", "details", "review", "processing", "success"]
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1] as any)
    }
  }

  const applyPromoCode = () => {
    const validCodes = {
      SAVE10: 10,
      STUDENT20: 20,
      WELCOME15: 15,
    }

    const upperCode = promoCode.toUpperCase()
    if (validCodes[upperCode as keyof typeof validCodes]) {
      const discountPercent = validCodes[upperCode as keyof typeof validCodes]
      setDiscount((total * discountPercent) / 100)
      toast( "Promo code applied!",
        {description: `You saved ${discountPercent}% with code ${upperCode}`,
      })
    } else {
      toast( "Invalid promo code",
        {description: "Please check your code and try again",
      
      })
    }
  }

  const processPayment = async () => {
    setCurrentStep("processing")
    setIsProcessing(true)
    setProcessingProgress(0)

    try {
      // Simulate payment processing
      const steps = [
        "Validating payment information...",
        "Contacting payment processor...",
        "Authorizing transaction...",
        "Processing payment...",
        "Confirming enrollment...",
        "Sending confirmation email...",
      ]

      for (let i = 0; i < steps.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 800))
        setProcessingProgress(((i + 1) / steps.length) * 100)
      }

      setCurrentStep("success")

      toast( "Payment successful!",
        {description: "You have been enrolled in your courses",
      })
    } catch (error) {
      toast.error( "Payment failed",
      {description: "Please check your payment information and try again",
        
      })
      setCurrentStep("review")
    } finally {
      setIsProcessing(false)
    }
  }

  const finalTotal = total - discount
  const tax = finalTotal * 0.08 // 8% tax

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Complete Your Purchase</span>
          </DialogTitle>
          <DialogDescription>
            {currentStep === "success"
              ? "Payment completed successfully!"
              : `Step ${["method", "details", "review", "processing"].indexOf(currentStep) + 1} of 3`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Indicator */}
          {currentStep !== "success" && (
            <div className="flex items-center space-x-2">
              {["method", "details", "review"].map((step, index) => {
                const isActive = step === currentStep
                const isCompleted = ["method", "details", "review"].indexOf(currentStep) > index

                return (
                  <div key={step} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        isCompleted
                          ? "bg-green-500 text-white"
                          : isActive
                            ? "bg-[#fdb606] text-white"
                            : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {isCompleted ? <CheckCircle className="h-4 w-4" /> : index + 1}
                    </div>
                    {index < 2 && <div className={`w-12 h-1 mx-2 ${isCompleted ? "bg-green-500" : "bg-gray-200"}`} />}
                  </div>
                )
              })}
            </div>
          )}

          {/* Step 1: Payment Method */}
          {currentStep === "method" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Choose Payment Method</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {paymentMethods.map((method) => {
                  const Icon = method.icon
                  return (
                    <button
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-colors text-left ${
                        selectedMethod === method.id
                          ? "border-[#fdb606] bg-[#fdb606]/10"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Icon className="h-6 w-6" />
                      <div>
                        <p className="font-medium">{method.label}</p>
                        <p className="text-sm text-gray-600">{method.description}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Step 2: Payment Details */}
          {currentStep === "details" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Payment Details</h3>

              {selectedMethod === "card" && (
                <div className="space-y-4">
                  {/* Card Information */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Card Information</h4>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input
                          id="cardNumber"
                          value={cardInfo.number}
                          onChange={(e) =>
                            setCardInfo((prev) => ({ ...prev, number: formatCardNumber(e.target.value) }))
                          }
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiry">Expiry Date</Label>
                          <Input
                            id="expiry"
                            value={cardInfo.expiry}
                            onChange={(e) => setCardInfo((prev) => ({ ...prev, expiry: formatExpiry(e.target.value) }))}
                            placeholder="MM/YY"
                            maxLength={5}
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            value={cardInfo.cvv}
                            onChange={(e) =>
                              setCardInfo((prev) => ({ ...prev, cvv: e.target.value.replace(/\D/g, "") }))
                            }
                            placeholder="123"
                            maxLength={4}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="cardName">Name on Card</Label>
                        <Input
                          id="cardName"
                          value={cardInfo.name}
                          onChange={(e) => setCardInfo((prev) => ({ ...prev, name: e.target.value }))}
                          placeholder="John Doe"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Billing Information */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Billing Information</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={billingInfo.firstName}
                          onChange={(e) => setBillingInfo((prev) => ({ ...prev, firstName: e.target.value }))}
                          placeholder="John"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={billingInfo.lastName}
                          onChange={(e) => setBillingInfo((prev) => ({ ...prev, lastName: e.target.value }))}
                          placeholder="Doe"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={billingInfo.email}
                        onChange={(e) => setBillingInfo((prev) => ({ ...prev, email: e.target.value }))}
                        placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={billingInfo.address}
                        onChange={(e) => setBillingInfo((prev) => ({ ...prev, address: e.target.value }))}
                        placeholder="123 Main Street"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={billingInfo.city}
                          onChange={(e) => setBillingInfo((prev) => ({ ...prev, city: e.target.value }))}
                          placeholder="New York"
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          value={billingInfo.state}
                          onChange={(e) => setBillingInfo((prev) => ({ ...prev, state: e.target.value }))}
                          placeholder="NY"
                        />
                      </div>
                      <div>
                        <Label htmlFor="zipCode">ZIP Code</Label>
                        <Input
                          id="zipCode"
                          value={billingInfo.zipCode}
                          onChange={(e) => setBillingInfo((prev) => ({ ...prev, zipCode: e.target.value }))}
                          placeholder="10001"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Select
                        value={billingInfo.country}
                        onValueChange={(value) => setBillingInfo((prev) => ({ ...prev, country: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="US">United States</SelectItem>
                          <SelectItem value="CA">Canada</SelectItem>
                          <SelectItem value="UK">United Kingdom</SelectItem>
                          <SelectItem value="AU">Australia</SelectItem>
                          <SelectItem value="DE">Germany</SelectItem>
                          <SelectItem value="FR">France</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {selectedMethod === "paypal" && (
                <div className="text-center py-8">
                  <Wallet className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold mb-2">PayPal Payment</h4>
                  <p className="text-gray-600 mb-4">You will be redirected to PayPal to complete your payment</p>
                  <Button className="bg-blue-600 hover:bg-blue-700">Continue with PayPal</Button>
                </div>
              )}

              {(selectedMethod === "apple" || selectedMethod === "google") && (
                <div className="text-center py-8">
                  <Smartphone className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold mb-2">
                    {selectedMethod === "apple" ? "Apple Pay" : "Google Pay"}
                  </h4>
                  <p className="text-gray-600 mb-4">
                    Use your {selectedMethod === "apple" ? "Touch ID, Face ID, or passcode" : "fingerprint or PIN"} to
                    complete the payment
                  </p>
                  <Button className="bg-gray-900 hover:bg-gray-800 text-white">
                    Pay with {selectedMethod === "apple" ? "Apple Pay" : "Google Pay"}
                  </Button>
                </div>
              )}

              {/* Save Payment Method */}
              <div className="flex items-center space-x-2">
             <Checkbox
  id="savePayment"
  checked={savePaymentMethod}
  onCheckedChange={(checked) => setSavePaymentMethod(!!checked)}
/>
                <Label htmlFor="savePayment" className="text-sm">
                  Save this payment method for future purchases
                </Label>
              </div>
            </div>
          )}

          {/* Step 3: Review & Confirm */}
          {currentStep === "review" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Review Your Order</h3>

              {/* Order Summary */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h4 className="font-medium">Order Summary</h4>
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <Badge variant="outline" className="text-xs">
                        {item.type}
                      </Badge>
                    </div>
                    <span className="font-medium">${item.price.toFixed(2)}</span>
                  </div>
                ))}

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-${discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${(finalTotal + tax).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Promo Code */}
              <div className="space-y-3">
                <h4 className="font-medium">Promo Code</h4>
                <div className="flex space-x-2">
                  <Input
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter promo code"
                  />
                  <Button onClick={applyPromoCode} variant="outline">
                    Apply
                  </Button>
                </div>
                <p className="text-sm text-gray-500">Try: SAVE10, STUDENT20, or WELCOME15</p>
              </div>

              {/* Payment Method Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium mb-2">Payment Method</h4>
                <div className="flex items-center space-x-3">
                  {selectedMethod === "card" && (
                    <>
                      <CreditCard className="h-5 w-5" />
                      <span>•••• •••• •••• {cardInfo.number.slice(-4)}</span>
                    </>
                  )}
                  {selectedMethod === "paypal" && (
                    <>
                      <Wallet className="h-5 w-5 text-blue-600" />
                      <span>PayPal</span>
                    </>
                  )}
                  {selectedMethod === "apple" && (
                    <>
                      <Smartphone className="h-5 w-5" />
                      <span>Apple Pay</span>
                    </>
                  )}
                  {selectedMethod === "google" && (
                    <>
                      <Smartphone className="h-5 w-5" />
                      <span>Google Pay</span>
                    </>
                  )}
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start space-x-2">
             <Checkbox
              id="agreeTerms"
              checked={agreeToTerms}
              onCheckedChange={(checked) => {
                if (checked === "indeterminate") {
                  setAgreeToTerms(false); // or set it to null, depending on your use case
                } else {
                  setAgreeToTerms(checked);
                }
              }}
            />
                <Label htmlFor="agreeTerms" className="text-sm leading-relaxed">
                  I agree to the <button className="text-[#fdb606] hover:underline">Terms of Service</button> and{" "}
                  <button className="text-[#fdb606] hover:underline">Privacy Policy</button>
                </Label>
              </div>

              {/* Security Notice */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Secure Payment</span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  Your payment information is encrypted and secure. We never store your card details.
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Processing */}
          {currentStep === "processing" && (
            <div className="text-center py-8 space-y-6">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#fdb606] mx-auto"></div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Processing Payment</h3>
                <p className="text-gray-600">Please don&apos;t close this window...</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{Math.round(processingProgress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-[#fdb606] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${processingProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Success */}
          {currentStep === "success" && (
            <div className="text-center py-8 space-y-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-green-800 mb-2">Payment Successful!</h3>
                <p className="text-gray-600">
                  You have been enrolled in {items.length} course{items.length > 1 ? "s" : ""}
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-left">
                <h4 className="font-medium text-green-800 mb-2">What&apos;s Next?</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Check your email for enrollment confirmation</li>
                  <li>• Access your courses from the &quot;My Learning section</li>
                  <li>• Download the mobile app for learning on the go</li>
                  <li>• Join our community forum to connect with other learners</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button className="flex-1 bg-[#fdb606] hover:bg-[#f39c12]">Start Learning</Button>
                <Button variant="outline" className="flex-1">
                  View Receipt
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {currentStep !== "success" && currentStep !== "processing" && (
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            {currentStep !== "method" && (
              <Button variant="outline" onClick={prevStep}>
                Back
              </Button>
            )}
            <Button onClick={onClose} variant="outline">
              Cancel
            </Button>
            {currentStep === "review" ? (
              <Button onClick={processPayment} disabled={!agreeToTerms} className="bg-[#fdb606] hover:bg-[#f39c12]">
                <Lock className="h-4 w-4 mr-2" />
                Complete Payment
              </Button>
            ) : (
              <Button onClick={nextStep} disabled={!validateStep()} className="bg-[#fdb606] hover:bg-[#f39c12]">
                Continue
              </Button>
            )}
          </DialogFooter>
        )}

        {currentStep === "success" && (
          <DialogFooter>
            <Button onClick={onClose} className="w-full bg-[#fdb606] hover:bg-[#f39c12]">
              Close
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
