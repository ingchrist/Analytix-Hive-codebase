"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { Trash2, Plus, Minus, Star, Clock, Users, Tag, CreditCard, Shield, Gift } from "lucide-react"

import PaymentModal from "@/components/modals/payment-modal"
import Image from "next/image"
interface CartItem {
  id: string
  courseId: string
  title: string
  instructor: string
  instructorAvatar: string
  thumbnail: string
  originalPrice: number
  discountPrice?: number
  discount?: number
  rating: number
  duration: number
  studentsCount: number
  level: string
  quantity: number
  addedAt: string
}

interface CheckoutData {
  subtotal: number
  discount: number
  tax: number
  total: number
  savings: number
}

const dummyCartItems: CartItem[] = [
  {
    id: "cart-1",
    courseId: "4",
    title: "Python for Data Science",
    instructor: "David Kumar",
    instructorAvatar: "/ai.png?height=32&width=32",
    thumbnail: "/ai.png?height=120&width=200",
    originalPrice: 99.99,
    discountPrice: 49.99,
    discount: 50,
    rating: 4.7,
    duration: 2700,
    studentsCount: 15420,
    level: "Intermediate",
    quantity: 1,
    addedAt: "2024-01-20",
  },
  {
    id: "cart-2",
    courseId: "5",
    title: "Digital Marketing Strategy",
    instructor: "Lisa Rodriguez",
    instructorAvatar: "/ai.png?height=32&width=32",
    thumbnail: "/ai.png?height=120&width=200",
    originalPrice: 79.99,
    discountPrice: 39.99,
    discount: 50,
    rating: 4.5,
    duration: 2100,
    studentsCount: 8930,
    level: "Beginner",
    quantity: 1,
    addedAt: "2024-01-19",
  },
]

export default function Cart() {
  const [cartItems, setCartItems] = useState<CartItem[]>(dummyCartItems)
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [promoCode, setPromoCode] = useState("")
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null)
  const [promoDiscount, setPromoDiscount] = useState(0)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)

  // Calculate totals
  const calculateTotals = (): CheckoutData => {
    const subtotal = cartItems.reduce((sum, item) => {
      const price = item.discountPrice || item.originalPrice
      return sum + price * item.quantity
    }, 0)

    const originalTotal = cartItems.reduce((sum, item) => {
      return sum + item.originalPrice * item.quantity
    }, 0)

    const courseDiscount = originalTotal - subtotal
    const promoDiscountAmount = (subtotal * promoDiscount) / 100
    const discountedSubtotal = subtotal - promoDiscountAmount
    const tax = discountedSubtotal * 0.08 // 8% tax
    const total = discountedSubtotal + tax
    const totalSavings = courseDiscount + promoDiscountAmount

    return {
      subtotal,
      discount: courseDiscount + promoDiscountAmount,
      tax,
      total,
      savings: totalSavings,
    }
  }

  const totals = calculateTotals()

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return

    setCartItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, quantity: newQuantity } : item)))

    toast( "Quantity updated",
      {description: "Cart has been updated successfully",
    })
  }

  const removeItem = (itemId: string) => {
    const item = cartItems.find((item) => item.id === itemId)
    setCartItems((prev) => prev.filter((item) => item.id !== itemId))

    toast( "Item removed",
      {description: `${item?.title} has been removed from your cart`,
    })
  }

  const clearCart = () => {
    setCartItems([])
    toast( "Cart cleared",
      {description: "All items have been removed from your cart",
    })
  }

  const applyPromoCode = () => {
    const validPromoCodes = {
      SAVE20: 20,
      STUDENT15: 15,
      WELCOME10: 10,
    }

    const upperPromoCode = promoCode.toUpperCase()

    if (validPromoCodes[upperPromoCode as keyof typeof validPromoCodes]) {
      const discount = validPromoCodes[upperPromoCode as keyof typeof validPromoCodes]
      setAppliedPromo(upperPromoCode)
      setPromoDiscount(discount)
      setPromoCode("")

      toast( "Promo code applied!",
        {description: `You saved ${discount}% with code ${upperPromoCode}`,
      })
    } else {
      toast( "Invalid promo code",
        {description: "Please check your code and try again",
       
      })
    }
  }

  const removePromoCode = () => {
    setAppliedPromo(null)
    setPromoDiscount(0)
    toast( "Promo code removed",
      {description: "Promo code discount has been removed",
    })
  }

  const handleCheckout = async () => {
    setIsProcessing(true)
    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 3000))

      toast( "Purchase successful!",
        {description: `You've successfully enrolled in ${cartItems.length} course${cartItems.length > 1 ? "s" : ""}`,
      })

      // Clear cart after successful purchase
      setCartItems([])
      setIsCheckoutModalOpen(false)
      setAppliedPromo(null)
      setPromoDiscount(0)
    } catch (error) {
      toast( "Payment failed",
        {description: "Please try again or contact support",
      
      })
    } finally {
      setIsProcessing(false)
    }
  }

  if (cartItems.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Shopping Cart</h1>

        <Card>
          <CardContent className="text-center py-12">
            <Image
              src="/ai.png?height=16&width=16"
              alt="Cart"
              className="h-16 w-16 text-gray-300 mx-auto mb-4"
            />
            <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
            <p className="text-gray-600 mb-6">Browse our course catalog and add courses to your cart to get started.</p>
            <Button className="bg-[#fdb606] hover:bg-[#f39c12]">Browse Courses</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Shopping Cart</h1>
          <p className="text-gray-600">
            {cartItems.length} item{cartItems.length > 1 ? "s" : ""} in your cart
          </p>
        </div>
        <Button variant="outline" onClick={clearCart}>
          <Trash2 className="h-4 w-4 mr-2" />
          Clear Cart
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Course Image */}
                  <div className="flex-shrink-0">
                    <Image
                      src={item.thumbnail || "/ai.png"}
                      alt={item.title}
                      className="w-full sm:w-32 h-20 object-cover rounded-lg"
                    />
                  </div>

                  {/* Course Details */}
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg line-clamp-2">{item.title}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={item.instructorAvatar || "/ai.png"} />
                            <AvatarFallback>{item.instructor.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-gray-600">{item.instructor}</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{item.rating}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>
                          {Math.floor(item.duration / 60)}h {item.duration % 60}m
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{item.studentsCount.toLocaleString()}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {item.level}
                      </Badge>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium">Quantity:</span>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="h-8 w-8 p-0"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          {item.discountPrice ? (
                            <>
                              <span className="text-xl font-bold text-[#fdb606]">
                                ${(item.discountPrice * item.quantity).toFixed(2)}
                              </span>
                              <span className="text-sm text-gray-500 line-through">
                                ${(item.originalPrice * item.quantity).toFixed(2)}
                              </span>
                              {item.discount && <Badge className="bg-red-500 text-white">{item.discount}% OFF</Badge>}
                            </>
                          ) : (
                            <span className="text-xl font-bold">
                              ${(item.originalPrice * item.quantity).toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Promo Code */}
              <div className="space-y-3">
                <h4 className="font-medium">Promo Code</h4>
                {appliedPromo ? (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Tag className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-800">{appliedPromo}</span>
                      <Badge className="bg-green-500 text-white">-{promoDiscount}%</Badge>
                    </div>
                    <Button variant="ghost" size="sm" onClick={removePromoCode}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Enter promo code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && applyPromoCode()}
                    />
                    <Button variant="outline" onClick={applyPromoCode} disabled={!promoCode.trim()}>
                      Apply
                    </Button>
                  </div>
                )}
                <p className="text-xs text-gray-500">Try: SAVE20, STUDENT15, or WELCOME10</p>
              </div>

              <Separator />

              {/* Price Breakdown */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${totals.subtotal.toFixed(2)}</span>
                </div>

                {totals.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-${totals.discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${totals.tax.toFixed(2)}</span>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${totals.total.toFixed(2)}</span>
                </div>

                {totals.savings > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <Gift className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">You save ${totals.savings.toFixed(2)}!</span>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Checkout Button */}
              <Button
                className="w-full bg-[#fdb606] hover:bg-[#f39c12] text-lg py-6"
                onClick={() => setIsPaymentModalOpen(true)}
              >
                <CreditCard className="h-5 w-5 mr-2" />
                Proceed to Checkout
              </Button>

              {/* Security Badge */}
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <Shield className="h-4 w-4" />
                <span>Secure 256-bit SSL encryption</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        items={cartItems.map((item) => ({
          id: item.id,
          name: item.title,
          price: item.discountPrice || item.originalPrice,
          type: "course" as const,
        }))}
        total={totals.total}
      />
    </div>
  )
}
