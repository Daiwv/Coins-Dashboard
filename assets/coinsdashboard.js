/*
 * @author Roman Nabokov
 * @copyright Januar 2018
 */

/* Информация
Using newer versions of jQuery and jQuery UI in place of the links given in problem statement
все данные хранятся локально у пользователя
данные пользователя сохраняются под переменной dash.data
все  что касается работы программы задокументированно комментариями в коде
*/


var cont = true;
var audio = new Audio();
audio.src = 'sound/01.mp3';
audio.load();

var userLimitCheck;
var key;
var inform;
var price;
var soundOpt;
var workStatusChange;
//запуск опроса API
function start () {
    if (cont === false) {
        cont = true;
        getData();
    }
    else {
        getData();
    }
}
//остановка опроса API
function stopUpdate () {
    if (cont === true) {
        cont = false;
    }
}
//Функция опроса API и вывода на страницу
function getData() {
    var xmlhttp;
    var inputUserLimit;
    var currencyCheck;
    var currencyText;
    var status;


   //начинаем опрос
    ( function loadXMLDoc() {

        if (window.XMLHttpRequest) {                // код для IE7+, Firefox, Chrome, Opera, Safari
            xmlhttp = new XMLHttpRequest();
        }
        else {                                      // код для IE6, IE5
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }

        xmlhttp.onreadystatechange = function () {      //проверяем готовность

            if (xmlhttp.readyState === 4 && xmlhttp.status === 200 && cont === true) {

                inform = JSON.parse(xmlhttp.responseText); // если готовы то парсим ответ от API в JSON
                //массив с привязкой к клокам данных из ответа API


                var  i = $(".dash-price").length;
                inputUserLimit = $(".dash-priceLimit");
                currencyCheck = $(".dash-currencyInput");

                //цикл оновления всех нужных полей страницы
                  for (var l = 0; l < i; l++) {
                    userLimitCheck = inputUserLimit[l];
                    key = currencyCheck[l].innerHTML;
                    key = key.toUpperCase();
                    price = $(".dash-price:eq("+ l +")");
                    // noinspection Annotator
                      price.html(inform[key].buy_price);
                    currencyText = $(".dash-dashCurrencyText:eq("+ l + ")");


                    soundOpt = $("#noAlarm").prop("checked");

                    //сигнализация о событии
                    if (+userLimitCheck.innerHTML < 0) {
                        lowCheckLimit();
                    }
                    else {
                        highCheckLimit();
                    }

                }
                //индикатор работы програмы
                status = $(".status").css("background-color");
                switch (status) {
                    case "rgb(255, 0, 0)":
                        checkWorkStatus("background-color", "green");
                        break;
                    case "rgb(227, 227, 227)":
                       checkWorkStatus("background-color", "green");
                        break;
                        case "rgb(0, 128, 0)":
                            checkWorkStatus("background-color", "red");
                            break;
                }

            }

        };
        xmlhttp.open("GET", "https://api.exmo.com/v1/ticker/", true); //запрос на сервер
        xmlhttp.send();

        if (cont === false) {
            console.log();
            checkWorkStatus("background-color", "rgb(227, 227, 227)");

        }
        else {
            setTimeout(arguments.callee, 1000);
        }



    })();

}
//конец работы с API

function checkWorkStatus(value, condition) {
    workStatusChange = $(".status").css(value, condition);
//return workStatusChange;
}

function lowCheckLimit() {
    // noinspection Annotator
    if (inform[key].buy_price < Math.abs(+userLimitCheck.innerHTML) && soundOpt === false) {
        // noinspection JSIgnoredPromiseFromCall
        audio.play();
        price.css("color","red");
    }
    else {
        price.css("color","green");
    }
}

function highCheckLimit() {
    // noinspection Annotator
    if (inform[key].buy_price > +userLimitCheck.innerHTML && soundOpt === false) {
        // noinspection JSIgnoredPromiseFromCall
        audio.play();
        price.css("color","red");
    }
    else {
        price.css("color","green");
    }
}

// noinspection JSUnusedAssignment
var dash = dash || {},
    data = JSON.parse(localStorage.getItem("dashData"));

data = data || {};

(function(dash, data, $) {

    var defaults = {
        dashCurrency: "dash-currency",
        dashPriceLimit: "dash-priceLimit",
        dashPrice: "dash-price",
        dashCurrencyInput: "dash-currencyInput",
        caseId: "case-",
        formId: "dash-form",
        dataAttribute: "data",
        deleteDiv: "delete-div",
        dashCurrencyText: "dash-dashCurrencyText"
    }, codes = {
        "1" : "#pending",
        "2" : "#inProgress",
        "3" : "#completed"
    };

    dash.init = function (options) {

        options = options || {};
        options = $.extend({}, defaults, options);

        $.each(data, function (index, params) {
            generateElement(params);
        });

        /*generateElement({
            id: "123",
            code: "1",
            priceLimit: "1234",
            price: "market price",
            currency: "btc_usd"
        });*/

        /*removeElement({
            id: "123",
            code: "1",
            priceLimit: "1234",
            price: "market Price",
            currency: "btc_eur"
        });*/

        // Adding drop function to each category of case
        $.each(codes, function (index, value) {
            $(value).droppable({
                drop: function (event, ui) {
                    var element = ui.helper,
                        css_id = element.attr("id"),
                        id = css_id.replace(options.caseId, ""),
                        object = data[id];

                    // Removing old element
                    removeElement(object);

                    // Changing object code
                    object.code = index;

                    // Generating new element
                    generateElement(object);

                    // Updating Local Storage
                    data[id] = object;
                    localStorage.setItem("dashData", JSON.stringify(data));

                    // Hiding Delete Area
                    $("#" + defaults.deleteDiv).hide();
                }
            });
        });

        // Adding drop function to delete div
        $("#" + options.deleteDiv).droppable({
            drop: function(event, ui) {
                var element = ui.helper,
                    css_id = element.attr("id"),
                    id = css_id.replace(options.caseId, ""),
                    object = data[id];

                // Removing old element
                removeElement(object);

                // Updating local storage
                delete data[id];
                localStorage.setItem("dashData", JSON.stringify(data));

                // Hiding Delete Area
                $("#" + defaults.deleteDiv).hide();
            }
        })

    };

    // Add case
    var generateElement = function(params){
        var parent = $(codes[params.code]),
            wrapper;

        if (!parent) {
            return;
        }

        wrapper = $("<div />", {
            "class" : defaults.dashCurrency,
            "id" : defaults.caseId + params.id,
            "data" : params.id
        }).appendTo(parent);

        $("<div />", {
            "class" : defaults.dashPriceLimit,
            "text": params.priceLimit
        }).appendTo(wrapper);

        $("<div />", {
            "class" : defaults.dashPrice,
            "text": params.price
        }).appendTo(wrapper);

        $("<div />", {
            "class" : defaults.dashCurrencyInput,
            "text": params.currency
        }).appendTo(wrapper);

        $("<div />", {
            "class" : defaults.dashCurrencyText,
            "text": params.currencyText
        }).appendTo(wrapper);

        wrapper.draggable({
            start: function() {
                $("#" + defaults.deleteDiv).show();
            },
            stop: function() {
                $("#" + defaults.deleteDiv).hide();
            },
            revert: "invalid",
            revertDuration : 200
        });

    };

    // Remove case
    var removeElement = function (params) {
        $("#" + defaults.caseId + params.id).remove();
    };

    dash.add = function() {
        var inputs = $("#" + defaults.formId + " :input"),
            errorMessage = "Лимит цены не может быть пустым",
            id, priceLimit, currency, currencyText, price, tempData;

        if (inputs.length !== 4) {
            return;
        }

        priceLimit = inputs[0].value;
        currency = inputs[1].value;
        price = inputs[2].value;
        currencyText = inputs[1].value.toUpperCase();
        if (!priceLimit) {
            generateDialog(errorMessage);
            return;
        }

        id = new Date().getTime();

        tempData = {
            id : id,
            code: "1",
            priceLimit: priceLimit,
            price: price,
            currency: currency,
            currencyText: currencyText
        };

        // Saving element in local storage
        data[id] = tempData;
        localStorage.setItem("dashData", JSON.stringify(data));

        // Generate Dash Element
        generateElement(tempData);

        // Reset Form
        inputs[0].value = "";
        inputs[1].value = "";
        inputs[2].value = "";

    };

    var generateDialog = function (message) {
        var responseId = "response-dialog",
            title = "Ошибка",
            responseDialog = $("#" + responseId),
            buttonOptions;

        if (!responseDialog.length) {
            responseDialog = $("<div />", {
                title: title,
                id: responseId
            }).appendTo($("body"));
        }

        responseDialog.html(message);

        buttonOptions = {
            "Ok" : function () {
                responseDialog.dialog("close");
            }
        };

        responseDialog.dialog({
            autoOpen: true,
            width: 400,
            modal: true,
            closeOnEscape: true,
            buttons: buttonOptions
        });
    };

    dash.clear = function () {
        data = {};
        localStorage.setItem("dashData", JSON.stringify(data));
        $("." + defaults.dashCurrency).remove();
    };

})(dash, data, jQuery);

