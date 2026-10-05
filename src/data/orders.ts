const daysAgo = (days: number) => new Date(Date.now() - days * 86400000);

export const orders = [
  { orderId: "ORD1001", customerId: "CUS001", productName: "Wireless Headphones", amount: 149, status: "DELIVERED", deliveredAt: daysAgo(10), refundable: true, refundProcessed: false },
  { orderId: "ORD1002", customerId: "CUS002", productName: "Mechanical Keyboard", amount: 129, status: "DELIVERED", deliveredAt: daysAgo(5), refundable: true, refundProcessed: false },
  { orderId: "ORD1003", customerId: "CUS003", productName: "USB-C Hub", amount: 59, status: "DELIVERED", deliveredAt: daysAgo(18), refundable: true, refundProcessed: false },
  { orderId: "ORD1004", customerId: "CUS004", productName: "Smart Watch", amount: 299, status: "DELIVERED", deliveredAt: daysAgo(25), refundable: true, refundProcessed: false },
  { orderId: "ORD1005", customerId: "CUS005", productName: "Gift Card", amount: 100, status: "DELIVERED", deliveredAt: daysAgo(7), refundable: false, refundProcessed: false },
  { orderId: "ORD1006", customerId: "CUS006", productName: "Laptop Stand", amount: 79, status: "DELIVERED", deliveredAt: daysAgo(12), refundable: true, refundProcessed: true },
  { orderId: "ORD1007", customerId: "CUS007", productName: "Bluetooth Speaker", amount: 199, status: "DELIVERED", deliveredAt: daysAgo(3), refundable: true, refundProcessed: false },
  { orderId: "ORD1008", customerId: "CUS008", productName: "4K Monitor", amount: 449, status: "DELIVERED", deliveredAt: daysAgo(47), refundable: true, refundProcessed: false },
  { orderId: "ORD1009", customerId: "CUS009", productName: "Gaming Mouse", amount: 89, status: "DELIVERED", deliveredAt: daysAgo(8), refundable: true, refundProcessed: false },
  { orderId: "ORD1010", customerId: "CUS010", productName: "Webcam", amount: 119, status: "PROCESSING", refundable: true, refundProcessed: false },
  { orderId: "ORD1011", customerId: "CUS011", productName: "Tablet", amount: 599, status: "DELIVERED", deliveredAt: daysAgo(9), refundable: true, refundProcessed: false },
  { orderId: "ORD1012", customerId: "CUS012", productName: "Desk Lamp", amount: 69, status: "CANCELLED", refundable: true, refundProcessed: false },
  { orderId: "ORD1013", customerId: "CUS013", productName: "Noise Cancelling Earbuds", amount: 219, status: "DELIVERED", deliveredAt: daysAgo(14), refundable: true, refundProcessed: false },
  { orderId: "ORD1014", customerId: "CUS014", productName: "External SSD", amount: 159, status: "DELIVERED", deliveredAt: daysAgo(29), refundable: true, refundProcessed: false },
  { orderId: "ORD1015", customerId: "CUS015", productName: "Smartphone", amount: 799, status: "DELIVERED", deliveredAt: daysAgo(2), refundable: true, refundProcessed: false }
];
