// Đối tượng
function Validator(options) {
  function getParent(element, selector) {
    while (element.parentElement) {
      if (element.parentElement.matches(selector)) {
        return element.parentElement;
      }
      element = element.parentElement;
    }
  }

  var selectorRules = {};
  //Hàm thực hiện validate
  function validate(inputElement, rule) {
    var errorElement = getParent(
      inputElement,
      options.formGroupSelector
    ).querySelector(options.errorSelector);
    var errorMessage;

    //Lấy ra các rules của selector
    var rules = selectorRules[rule.selector];
    //Lặp qua từng rule và kiểm tra
    //Nếu có lỗi thì dừng việc kiểm tra
    for (var i = 0; i < rules.length; ++i) {
      switch (inputElement.type) {
        case 'checkbox':
        case 'radio':
          errorMessage = rules[i](
            formElement.querySelector(rule.selector + ':checked')
          );
          break;
        default:
          errorMessage = rules[i](inputElement.value);
      }
      if (errorMessage) break;
    }

    if (errorMessage) {
      errorElement.innerHTML = errorMessage;
      getParent(inputElement, options.formGroupSelector).classList.add(
        'invalid'
      );
    } else {
      errorElement.innerHTML = '';
      getParent(inputElement, options.formGroupSelector).classList.remove(
        'invalid'
      );
    }

    return !errorMessage;
  }
  //Lấy element của form cần validate
  var formElement = document.querySelector(options.form);

  if (formElement) {
    formElement.onsubmit = function (e) {
      e.preventDefault();

      var isFormValid = true;

      //Thực hiện lặp qua từng rule và validate
      options.rules.forEach(function (rule) {
        var inputElement = formElement.querySelector(rule.selector);
        var isValid = validate(inputElement, rule);
        if (!isValid) {
          isFormValid = false;
        }
      });

      if (isFormValid) {
        //Trường hợp submit với JavaScript
        if (typeof options.onSubmit === 'function') {
          var enableInputs = formElement.querySelectorAll('[name]');

          var formValues = Array.from(enableInputs).reduce(function (
            values,
            input
          ) {
            switch (input.type) {
              case 'radio':
                values[input.name] = formElement.querySelector(
                  'input[name="' + input.name + '"]:checked'
                ).value;
                break;
              case 'checkbox':
                values[input.name] = Array.from(
                  formElement.querySelectorAll(
                    'input[name="' + input.name + '"]:checked'
                  )
                ).map((inp) => inp.value);
                break;
              case 'file':
                values[input.name] = input.files;
                break;
              default:
                values[input.name] = input.value;
            }
            return values;
          },
          {});
          options.onSubmit(formValues);
        }
        //Trường hợp submit với hành vi mặc định
        else {
          formElement.submit();
        }
      }
    };

    //Xử lý lặp qua mỗi rule và xử lý (lắng nghe sự kiện blur, input)
    options.rules.forEach(function (rule) {
      //Lưu lại các rules cho mỗi input
      if (Array.isArray(selectorRules[rule.selector])) {
        selectorRules[rule.selector].push(rule.test);
      } else {
        selectorRules[rule.selector] = [rule.test];
      }

      var inputElements = formElement.querySelectorAll(rule.selector);

      Array.from(inputElements).forEach(function (inputElement) {
        //Xử lý trường hợp blur khỏi input
        inputElement.onblur = function () {
          validate(inputElement, rule);
        };
        //Xử lý mỗi khi người dùng nhập vào input
        inputElement.oninput = function () {
          var errorElement = getParent(
            inputElement,
            options.formGroupSelector
          ).querySelector(options.errorSelector);
          errorElement.innerHTML = '';
          getParent(inputElement, options.formGroupSelector).classList.remove(
            'invalid'
          );
        };
      });
    });
  }
}

//Định nghĩa rules
//Nguyên tắc của các rules
//1. Khi có lỗi => Trả về message lỗi
//2. Khi hợp lệ => Không trả ra cái gì cả (undefined)
Validator.isRequired = function (selector, message) {
  return {
    selector: selector,
    test: function (value) {
      return value ? undefined : message || 'Please fill in the blank!';
    },
  };
};
Validator.isEmail = function (selector, message) {
  return {
    selector: selector,
    test: function (value) {
      var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      return regex.test(value)
        ? undefined
        : message || 'Please fill a valid email address!';
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
Validator.isConfirmed = function (selector, getConfirmValue, message) {
  return {
    selector: selector,
    test: function (value) {
      return value === getConfirmValue()
        ? undefined
        : message || 'Incorrect value';
    },
  };
};
