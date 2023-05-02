app.config(function ($routeProvider, $httpProvider) {
  $httpProvider.interceptors.push('tokenConfig');
  $httpProvider.interceptors.push('authInterceptor');
  $routeProvider
    .when("/", {
      templateUrl: "/views/dashboard.html",
    })
    .when("/statistical", {
      templateUrl: "/views/statistical/statis.html",
      controller: "statisCtrl",
    })
    .when("/bookings", {
      templateUrl: "/views/booking/list.html",
      controller: "listBookingCtrl",
    })
    .when("/bookings/create", {
      templateUrl: "/views/booking/booking.html",
      controller: "createBookingCtrl",
    })
    .when("/accounts", {
      templateUrl: "/views/account/table.html",
      controller: "accountListCtrl",
    })
    .when("/accounts/create", {
      templateUrl: "/views/account/create.html",
      controller: "accountCreateCtrl",
    })
    .when("/accounts/update/:username", {
      templateUrl: "/views/account/update.html",
      controller: "accountUpdateCtrl",
    })
    .when("/accounts/role", {
      templateUrl: "/views/account/role.html",
      controller: "accountRoleCtrl",
    })
    //hotel-room
    .when("/hotel-room", {
      templateUrl: "/views/hotel-room/index.html",
      controller: "hotelRoomCtrl",
    })
    .when("/hotel-room/:bookingCode", {
      templateUrl: "/views/hotel-room/index.html",
      controller: "hotelRoomCtrl",
    })
    //invoice
    .when("/invoices", {
      templateUrl: "/views/invoice/index.html",
      controller: "invoiceCtrl",
    })
    .when("/invoices/:code", {
      templateUrl: "/views/invoice/detail.html",
      controller: "invoiceDetailCtrl",
    })
    //setting
    .when("/setting", {
      templateUrl: "/views/setting/index.html",
      controller: "settingCtrl",
    })
    //Checkin-Checkout
    .when("/checkin/:roomCode", {
      templateUrl: "/views/checkin/checkin.html",
      controller: "checkinCtrl",
    })
    .when("/checkout/:roomCode", {
      templateUrl: "/views/checkout/checkout.html",
      controller: "checkoutCtrl",
    })
    //Service
    .when("/service", {
      templateUrl: "/views/service/serviceView.html",
      controller: "serviceCtrl",
    })
    .when("/service/type", {
      templateUrl: "/views/service-type/service-typeView.html",
      controller: "service-typeCtrl",
    })
    //Customer
    .when("/customers", {
      templateUrl: "/views/customers/customer.html",
      controller: "customerCtrl",
    })
    .when("/customers/edit/:customerId", {
      templateUrl: "/views/customers/form.html",
      controller: "customerEditCtrl",
    })
    .when("/customers/types", {
      templateUrl: "/views/customers/type.html",
      controller: "customerTypeCtrl",
    })
    //Payment
    .when("/payment", {
      templateUrl: "/views/payment/table.html",
      controller: "paymentListCtrl",
    })
    .when("/payment/create", {
      templateUrl: "/views/payment/create.html",
      controller: "paymentCreateCtrl",
    })
    .when("/payment/update/:id", {
      templateUrl: "/views/payment/update.html",
      controller: "paymentUpdateCtrl",
    })
    //Promotion
    .when("/promotion", {
      templateUrl: "/views/promotion/promotionView.html",
      controller: "promotionCtrl",
    })
    //Supply
    .when("/supply", {
      templateUrl: "/views/supply/table.html",
      controller: "supplyCtrl",
    })
    .when("/supply/create", {
      templateUrl: "/views/supply/createSupply.html",
      controller: "supplyCreateCtrl",
    })
    .when("/supply/update/:id", {
      templateUrl: "/views/supply/updateSupply.html",
      controller: "supplyUpdateCtrl",
    })
    .when("/supply/type", {
      templateUrl: "/views/supply/tableType.html",
      controller: "supply-typeCtrl",
    })
    .when("/supply/createType", {
      templateUrl: "/views/supply/createType.html",
      controller: "supplyCreate-typeCtrl",
    })
    .when("/supply/updateType/:id", {
      templateUrl: "/views/supply/updateType.html",
      controller: "supplyUpdate-typeCtrl",
    })
    //
    //Room
    .when("/room", {
      templateUrl: "/views/room/table.html",
      controller: "roomListCtrl",
    })
    .when("/room/create", {
      templateUrl: "/views/room/createForm.html",
      controller: "roomCreateFormCtrl",
    })
    .when("/room/update/:id", {
      templateUrl: "/views/room/updateForm.html",
      controller: "roomUpdateFormCtrl",
    })
    //Room type
    .when("/room-type", {
      templateUrl: "/views/roomType/table.html",
      controller: "roomTypeListCtrl",
    })
    .when("/room-type/create", {
      templateUrl: "/views/roomType/createForm.html",
      controller: "roomTypeCreateFormCtrl",
    })
    .when("/room-type/update/:id", {
      templateUrl: "/views/roomType/updateForm.html",
      controller: "roomTypeUpdateFormCtrl",
    })
    //Authenticate
    .when("/login", {
      templateUrl: "/views/authenticate/login.html",
      controller: "loginCtrl",
    })
    .when("/reset-password/:token", {
      templateUrl: "/views/authenticate/resetPassword.html",
      controller: "loginCtrl",
    })
    .otherwise({
      templateUrl: "/views/404.html",
    });
});
