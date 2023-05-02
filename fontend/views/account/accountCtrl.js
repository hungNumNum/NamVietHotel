app.controller("accountCreateCtrl", function ($scope, $location, $http) {

    $scope.isShowPassword = false;
    $scope.isShowConfirmPassword = false;
    $scope.account = {
        username: null,
        password: null,
        fullName: null,
        phoneNumber: null,
        email: null,
        address: null,
        status: true
    };

    $scope.handlerShowPassword = function () {
        $scope.isShowPassword = !$scope.isShowPassword;
        if ($scope.isShowPassword) {
            $('#password').attr('type', 'text');
        } else {
            $('#password').attr('type', 'password');
        }
    }

    $scope.handlerShowConfirmPassword = function () {
        $scope.isShowConfirmPassword = !$scope.isShowConfirmPassword;
        if ($scope.isShowConfirmPassword) {
            $('#confirmPassword').attr('type', 'text');
        } else {
            $('#confirmPassword').attr('type', 'password');
        }
    }

    $scope.create = function () {
        if (!$scope.account.username) {
            alert("Vui lòng nhập Tên đăng nhập!");
            $("#username").focus();
            return;
        }
        if (!$scope.account.fullName) {
            alert("Vui lòng nhập Họ và tên!");
            $("#fullName").focus();
            return;
        }
        const regexPassword = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
        if (!$scope.account.password) {
            alert("Vui lòng nhập Mật khẩu!");
            $("#password").focus();
            return;
        } else if (!regexPassword.test($scope.account.password)){
            alert("Mật khẩu sai định dạng. Độ dài tối thiểu 8 ký tự, có ít nhất 1 chữ in hoa và 1 số.");
            $("#password").focus();
            return;
        }
        if ($scope.account.password !== $scope.account.confirmPassword) {
            alert("Xác nhận Mật khẩu phải trùng mới Mật khẩu!");
            return;
        }
        const regexEmail = /^\w+@\w+(\.\w+){1,2}$/;
        if (!$scope.account.email) {
            alert("Vui lòng nhập Email!");
            $("#email").focus();
            return;
        } else if (!regexEmail.test($scope.account.email)){
            alert("Email sai định dạng. email@example.com");
            $("#email").focus();
            return;
        }
        if (!confirm("Bạn muốn tạo mới tài khoản?")) {
            return;
        }
        $http.post("http://localhost:8000/api/accounts", $scope.account).then(function (resp) {
            $scope.account = resp.data;
            alert("Tạo mới tài khoản thành công!");
            $location.path("/accounts");
        }, function (resp) {
            alert(resp.data.error);
        });
    };
});

app.controller("accountUpdateCtrl", function ($scope, $routeParams, $http, $location) {

    $scope.isShowPassword = false;
    $scope.isShowConfirmPassword = false;
    $scope.account = {};

    $scope.init = async function () {
        await $scope.loadForm();
    }

    $scope.loadForm = async function () {
        await $http.get("http://localhost:8000/api/accounts/" + $routeParams.username)
            .then(function (resp) {
                if (resp.status == 200) {
                    $scope.account = resp.data;
                }
            }, function (resp) {
                alert("Can't find account by id " + $routeParams.username);
                $location.path("/accounts");
            });
    }

    $scope.checkRole = function (role) {
        const check = $scope.userRoles.find(item => item.role.id == role.id);
        if (check) {
            return true;
        }
        return false;
    }

    $scope.handlerShowPassword = function () {
        $scope.isShowPassword = !$scope.isShowPassword;
        if ($scope.isShowPassword) {
            $('#password').attr('type', 'text');
        } else {
            $('#password').attr('type', 'password');
        }
    }

    $scope.handlerShowConfirmPassword = function () {
        $scope.isShowConfirmPassword = !$scope.isShowConfirmPassword;
        if ($scope.isShowConfirmPassword) {
            $('#confirmPassword').attr('type', 'text');
        } else {
            $('#confirmPassword').attr('type', 'password');
        }
    }

    $scope.update = function () {
        if (!$scope.account.username) {
            alert("Vui lòng nhập Tên đăng nhập!");
            $("#username").focus();
            return;
        }
        if (!$scope.account.fullName) {
            alert("Vui lòng nhập Họ và tên!");
            $("#fullName").focus();
            return;
        }
        const regexPassword = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
        if (!$scope.account.password) {
            alert("Vui lòng nhập Mật khẩu!");
            $("#password").focus();
            return;
        } else if (!regexPassword.test($scope.account.password)){
            alert("Mật khẩu sai định dạng. Độ dài tối thiểu 8 ký tự, có ít nhất 1 chữ in hoa và 1 số.");
            $("#password").focus();
            return;
        }
        if ($scope.account.password !== $scope.account.confirmPassword) {
            alert("Xác nhận Mật khẩu phải trùng mới Mật khẩu!");
            return;
        }
        const regexEmail = /^\w+@\w+(\.\w+){1,2}$/;
        if (!$scope.account.email) {
            alert("Vui lòng nhập Email!");
            $("#email").focus();
            return;
        } else if (!regexEmail.test($scope.account.email)){
            alert("Email sai định dạng. email@example.com");
            $("#email").focus();
            return;
        }
        if (!confirm("Bạn muốn cập nhật tài khoản?")) {
            return;
        }
        $http.put("http://localhost:8000/api/accounts", $scope.account).then(function (resp) {
            alert("Cập nhật tài khoản thành công!");
            $scope.account = resp.data;
        }, function (resp) {
            alert(resp.data.error);
        });
    };

    $scope.init();
});

app.controller("accountListCtrl", function ($scope, $window, $http) {

    $scope.isLoading = false;
    $scope.accounts = [];

    $scope.init = async function () {
        $scope.isLoading = true;
        await $scope.loadAccount();
        await $scope.initTableAccount();
    }

    $scope.initTableAccount = function () {
        $(document).ready(function () {
            tableAccounts = $('#datatable-accounts').DataTable({
                language: {
                    url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/vi.json',
                },
                columnDefs: [
                    {
                        targets: 5,
                        orderable: false
                    }
                ],
                buttons: [
                    {
                        extend: 'excelHtml5',
                        exportOptions: {
                            columns: [ 0, 1, 2 ]
                        }
                    },
                    {
                        extend: 'pdfHtml5',
                        exportOptions: {
                            columns: [ 0, 1, 2 ]
                        }
                    },
                    {
                        extend: 'print',
                        exportOptions: {
                            columns: [ 0, 1, 2 ]
                        }
                    }
                ],
                dom: '<"row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6 d-flex justify-content-end"B>>t<"row"<"col-sm-12 col-md-5"i><"col-sm-12 col-md-7"p>>'
            });
            $('#search-datatable-accounts').keyup(function () {
                tableAccounts.search($(this).val()).draw();
            });
        });
    }
    $scope.loadAccount = async function () {
        await $http.get("http://localhost:8000/api/accounts").then(function (resp) {
            $scope.accounts = resp.data;
            $scope.isLoading = false;
        });
    }

    $scope.handlerActivateAccount = function (account) {
        if (!confirm("Bạn muốn kích hoạt tài khoản?")) {
            return;
        }
        $http.post("http://localhost:8000/api/accounts/activate/" + account.username).then(function (resp) {
            alert("Kích hoạt tài khoản thành công!");
            account.status = true;
        }, function (resp) {
            alert(resp.data.error);
        });
    }

    $scope.handlerDeactivateAccount = function (account) {
        if (!confirm("Bạn muốn huỷ kích hoạt tài khoản?")) {
            return;
        }
        $http.post("http://localhost:8000/api/accounts/deactivate/" + account.username).then(function (resp) {
            alert("Huỷ kích hoạt tài khoản thành công!");
            account.status = false;
        }, function (resp) {
            alert(resp.data.error);
        });
    }

    $scope.init();
});

app.controller("accountRoleCtrl", function ($scope, $window, $http) {

    $scope.accounts = [];
    $scope.roles = [];
    $scope.userRoles = [];

    $scope.init = async function () {
        $scope.isLoading = true;
        await $scope.loadRole();
        await $scope.loadUserRole();
        await $scope.loadAccount();
        $scope.initTableUserRole();
    }

    $scope.initTableUserRole = function () {
        $(document).ready(function () {
            tableUserRole = $('#datatable-user-role').DataTable({
                language: {
                    url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/vi.json',
                },
                columnDefs: [
                    {
                        targets: [2, 3],
                        orderable: false
                    }
                ],
                dom: 't<"row"<"col-sm-12 col-md-5"i><"col-sm-12 col-md-7"p>>'
            });
            $('#search-datatable-user-role').keyup(function () {
                tableUserRole.search($(this).val()).draw();
            });
        });
    }

    $scope.loadAccount = async function () {
        await $http.get("http://localhost:8000/api/accounts")
            .then(resp => {
                $scope.accounts = resp.data;
                $scope.isLoading = false;
            });
    }

    $scope.loadRole = async function () {
        await $http.get("http://localhost:8000/api/roles")
            .then(resp => {
                if (resp.status == 200) {
                    $scope.roles = resp.data;
                }
            });
    }

    $scope.loadUserRole = async function () {
        await $http.get("http://localhost:8000/api/user-roles")
            .then(resp => {
                if (resp.status == 200) {
                    $scope.userRoles = resp.data;
                }
            });
    }

    $scope.userRoleOf = function (account, role) {
        return $scope.userRoles.find(userRole => userRole.account.id == account.id && userRole.role.id == role.id);
    }

    $scope.userRoleChanged = (account, role) => {
        const userRole = $scope.userRoleOf(account, role);
        if (userRole) {
            $scope.revokeUserRole(userRole);
        } else {
            $scope.grantUserRole({
                account: account,
                role: role
            });
        }
    }

    $scope.grantUserRole = function (userRole) {
        if (!confirm("Bạn muốn cấp quyền cho người dùng này?")) {
            return;
        }
        $http.post("http://localhost:8000/api/user-roles", userRole).then(resp => {
            $scope.userRoles.push(resp.data);
            alert("Cấp quyền thành công");
        }, error => {
            alert("Cấp quyền thất bại");
        });
    }

    $scope.revokeUserRole = function (userRole) {
        if (!confirm("Bạn muốn thu hồi quyền của người dùng này?")) {
            return;
        }
        $http.delete("http://localhost:8000/api/user-roles/" + userRole.id).then(resp => {
            const index = $scope.userRoles.findIndex(item => item.id == userRole.id);
            $scope.userRoles.splice(index, 1);
            alert("Thu hồi quyền thành công");
        }, error => {
            alert("Thu hồi quyền thất bại");
        });
    }

    $scope.init();
});
