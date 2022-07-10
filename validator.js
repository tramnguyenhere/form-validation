// Đối tượng
function Validator(options) {
  //Hàm thực hiện validate
  function validate(inputElement, rule) {
    var errorMessage = rule.test(inputElement.value);
    var errorElement = inputElement.parentElement.querySelector(
      options.errorSelector
    );

    if (errorMessage) {
      errorElement.innerHTML = errorMessage;
      inputElement.parentElement.classList.add('invalid');
    } else {
      errorElement.innerHTML = '';
      inputElement.parentElement.classList.remove('invalid');
    }
  }
  //Lấy element của form cần validate
  var formElement = document.querySelector(options.form);
  console.log(options.rules);
  if (formElement) {
    options.rules.forEach(function (rule) {
      var inputElement = formElement.querySelector(rule.selector);

      if (inputElement) {
        //Xử lý trường hợp blur khỏi input
        inputElement.onblur = function () {
          validate(inputElement, rule);
        };
        //Xử lý mỗi khi người dùng nhập vào input
        inputElement.oninput = function () {
          var errorElement = inputElement.parentElement.querySelector(
            options.errorSelector
          );
          errorElement.innerHTML = '';
          inputElement.parentElement.classList.remove('invalid');
        };
      }
    });
  }
}

//Định nghĩa rules
//Nguyên tắc của các rules
//1. Khi có lỗi => Trả về message lỗi
//2. Khi hợp lệ => Không trả ra cái gì cả (undefined)
Validator.isRequired = function (selector) {
  return {
    selector: selector,
    test: function (value) {
      return value.trim() ? undefined : 'Please fill in the blank!';
    },
  };
};
Validator.isEmail = function (selector) {
  return {
    selector: selector,
    test: function (value) {
      var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      return regex.test(value)
        ? undefined
        : 'Please fill a valid email address!';
    },
  };
};
Validator.minLength = function (selector, min) {
  return {
    selector: selector,
    test: function (value) {
      return value.length >= min
        ? undefined
        : `Please fill at least ${min} characters`;
    },
  };
};
