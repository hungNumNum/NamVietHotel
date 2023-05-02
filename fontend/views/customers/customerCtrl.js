app.controller("customerCtrl", function ($scope, $http) {

    $scope.selectedCustomer = {};
    $scope.numInvoicesOfCus = 0;

    //Customer
    $scope.initTable = function () {
        $scope.loading = true;
        $http.get("http://localhost:8000/api/customers").then(function (resp) {
            $scope.customers = resp.data;
            $(document).ready(function () {
                customerTable = $('#customer-table').DataTable({
                    language: {
                        url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/vi.json',
                    },
                    dom: 't<"row"<"col-sm-12 col-md-5"i><"col-sm-12 col-md-7"p>>'
                });
                $('#search-datatable-customer').keyup(function () {
                    customerTable.search($(this).val()).draw();
                });
            });
            $scope.loading = false;
        });
    }
    $scope.initTable();

    $scope.viewCustomer = function (customer) {
        $scope.selectedCustomer = customer;
        $http.get("http://localhost:8000/api/invoices/count-by-customer/" + $scope.selectedCustomer.peopleId).then(function (resp) {
            $scope.numInvoicesOfCus = resp.data;
        });
        $scope.frontIdCardUrl = "http://localhost:8000/images/" + $scope.selectedCustomer.frontIdCard;
        $scope.backIdCardUrl = "http://localhost:8000/images/" + $scope.selectedCustomer.backIdCard;
        $('#customer-modal').modal('show');
    };

    //Edit Customer
    $scope.editCustomer = function (customer) {
        $scope.customer = customer;
        $scope.customer.dateOfBirth = new Date($scope.customer.dateOfBirth);
        $http.get("http://localhost:8000/api/invoices/count-by-customer/" + customer.peopleId).then(function (resp) {
            $scope.numInvoicesOfCus = resp.data;
        });
        console.log(customer.peopleId);
        $('#edit-customer-modal').modal('show');
        $scope.frontIdCardUrl = "http://localhost:8000/images/" + $scope.customer.frontIdCard;
        $scope.backIdCardUrl = "http://localhost:8000/images/" + $scope.customer.backIdCard;
    };

    $scope.updateCustomer = function () {
        var r = confirm("Xác nhận cập nhật thông tin khách hàng.");
        if (r == false) {
            return;
        }
        $scope.loading = true;
        $http.put("http://localhost:8000/api/customers", $scope.customer).then(function (resp) {
            if (resp.status == 200) {
                alert("Cập nhật thành công");
            } else {
                alert("Cập nhật thất bại");
            }
            $scope.loading = false;
        });
    };

    //Customer Type
    $scope.viewCustomerType = function () {
        $scope.loading = true;
        $('#customer-type-modal').modal('show');
        $http.get("http://localhost:8000/api/customer-types").then(function (resp) {
            $scope.customerTypes = resp.data;
            $scope.loading = false;
            $scope.customerTypes.forEach(function (customerType) {
                customerType.numOfCustomers = 0;
                $scope.customers.forEach(function (customer) {
                    if (customer.customerType.id == customerType.id) {
                        customerType.numOfCustomers++;
                    }
                });
            });
            $scope.loading = false;
        });
    }

    $scope.closeModal = function () {
        $scope.historyBookings = [];
        $scope.showHistoryBooking = false;
    }

    $scope.showHistoryBookingOfCus = function (id) {
        $scope.loading = true;
        $http.get("http://localhost:8000/api/customers/history-booking/" + id).then(function (resp) {
            $scope.historyBookings = resp.data;
            $scope.historyBookings.reverse();
            $scope.loading = false;
        });
        $scope.showHistoryBooking = true;
    }

    $scope.hideHistoryBookingOfCus = function () {
        $scope.showHistoryBooking = false;
    }


});