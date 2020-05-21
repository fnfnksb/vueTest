var ValueLabel = function (pvalue, plabel) {
    this.value = pvalue;
    this.label = plabel;
};

Vue.filter("formatDate", function (value) {
    if (value == null) return value;
    return moment(value).format("YYYY-MM-DD");
});

Vue.filter("formatTimestamp", function (value) {
    if (value == null) return value;
    return moment(value).format("YYYY-MM-DD HH:mm:ss");
});

Vue.filter("numberFormat", function (value) {
    var num = parseInt(value);
    if (isNaN(num)) return "0";
    var reg = /(^[+-]?\d+)(\d{3})/;
    var n = value + "";
    while (reg.test(n)) n = n.replace(reg, "$1" + "," + "$2");
    return n;
});

Vue.filter("symbolFormat", function (currencyCode) {
    if (currencyCode == "") return "";
    for (i = 0; i < _CURRENCIES.length; i++) {
        if (_CURRENCIES[i].code == currencyCode) {
            return _CURRENCIES[i].sign;
        }
    }
    return "";
});

Vue.filter("convertHtml", function (value) {
    if (value == null) return value;
    var convertString = String.valueOf(value);
    value = value.replace(/\n/g, "<br />"); // 34 22
    value = value.replace(/\\n/g, "<br />"); // 34 22
    return value;
});

//Vue.filter('currency',function(value) {
//    return getCurrencyByCode(value);
//});

Vue.filter("currencyFormat", function (value, code) {
    if (isNaN(value)) return value;

    var country, currencyCode;
    if (!code || code.length != 3) {
        countryCode = "US";
        currencyCode = "USD";
    } else {
        country = code.substring(0, 2);
        currencyCode = code;
    }
    return value.toLocaleString(countryCode, {
        style: "currency",
        currency: currencyCode,
    });
});

Vue.filter("timeIsNull", function (value) {
    if (value == null) {
        return moment().format("YYYY-MM-DD");
    } else {
        return value;
    }
});

//Vue.filter('formatDate',function(value) {
//    if(value == null) return value;
//    return moment.utc(value+9*60*60*1000).format('YYYY-MM-DD');
//});
Vue.component("alert-msg", {
    template: "#alertTemplate",
    props: {
        id: "alertMsg",
    },
});

Vue.component("vue-select", {
    template: "#vue-select",
    props: {
        id: String,
        opts: Array,
        value: Object,
        blank: "",
    },
    methods: {
        /*        updateData : function(e){
            this.$emit("update", e.target.value);
        }*/
    },
});

Vue.component("modal", {
    template: "#modal-template",
    props: {
        id: String,
    },
});
Vue.component("image-modal", {
    template: "#image-modal-template",
    props: {
        id: String,
    },
});

Vue.directive("chosen", {
    inserted: function (el, binding, vnode) {
        //console.log(el);
        var vdirective = vnode.data.directives,
            vModel;
        for (var i = 0, vDirLength = vdirective.length; i < vDirLength; i++) {
            //console.log(vdirective[i].name );
            if (vdirective[i].name == "model") {
                //vModel = vdirective[i].expression;
                vModel = vdirective[i];
                //console.log(vdirective[i]);
                break;
            }
        }
        $(el).chosen({
            search_contains: true,
            width: "100%",
            no_results_text: "결과가 존재하지 않습니다.",
            placeholder_text_single: "선택해주세요",
            placeholder_text_multiple: "선택해주세요",
        });
        $(el)
            .chosen()
            .change(function (event, change) {
                if (Array.isArray(vModel.value)) {
                    var selected = vModel.value;
                    if (change.hasOwnProperty("selected")) {
                        selected.push(change.selected);
                    } else {
                        selected.splice(selected.indexOf(change.deselected), 1);
                    }
                } else {
                    var keys = vModel.expression.split(".");
                    var pointer = vnode.context;
                    while (keys.length > 1) pointer = pointer[keys.shift()];
                    pointer[keys[0]] = change.selected;
                }
            });
    },
    update: function (el, binding, vnode) {
        var vdirective = vnode.data.directives,
            vModel;
        for (var i = 0, vDirLength = vdirective.length; i < vDirLength; i++) {
            if (vdirective[i].name == "model") {
                vModel = vdirective[i];
                break;
            }
        }

        //if (!Array.isArray(vModel.value)) {
        $(el).val(vModel.value).trigger("chosen:updated");
        //}
    },
});

Vue.directive("icheck", {
    inserted: function (el, binding, vnode) {
        var vdirective = vnode.data.directives,
            vModel;
        for (var i = 0, vDirLength = vdirective.length; i < vDirLength; i++) {
            //console.log(vdirective[i].name );
            if (vdirective[i].name == "model") {
                //vModel = vdirective[i].expression;
                vModel = vdirective[i];
                break;
            }
        }

        $(el).iCheck({
            checkboxClass: "icheckbox_square-green",
            radioClass: "iradio_square-green",
            increaseArea: "20%", // optional
        });

        $(el).on("ifChanged", function (e) {
            // 체크박스 model 바인딩 설정
            if (binding.arg == "item") {
                var $elemt = $(this);

                if ($elemt.attr("type") == "checkbox" && $elemt.data("key")) {
                    var dataModel = vnode.data.attrs["data-model"];

                    if (dataModel != null && typeof dataModel === "object") {
                        if ($elemt.prop("checked")) {
                            dataModel[$elemt.data("key")] = $elemt.data(
                                "checkedValue"
                            );
                        } else {
                            dataModel[$elemt.data("key")] = $elemt.data(
                                "uncheckedValue"
                            );
                        }
                    }
                }
            } else {
                if (Array.isArray(vModel.value)) {
                    var selected = vModel.value;
                    if ($(this).prop("checked")) {
                        selected.push($(this).val());
                    } else {
                        selected.splice(selected.indexOf($(this).val()), 1);
                    }
                } else {
                    var keys = vModel.expression.split(".");
                    var pointer = vnode.context;
                    while (keys.length > 1) pointer = pointer[keys.shift()];

                    if (typeof vModel.value == "boolean") {
                        vModel.value = !vModel.value;
                        pointer[keys[0]] = vModel.value;
                    } else {
                        if (binding.arg == "custval") {
                            if ($(this).prop("checked")) {
                                // if(pointer[keys[0]] === undefined) {
                                //     Vue.set(pointer, keys[0], el.getAttribute('true-value'));
                                // }else {
                                //     pointer[keys[0]] = el.getAttribute('true-value');
                                // }
                                pointer[keys[0]] = el.getAttribute(
                                    "true-value"
                                );
                            } else {
                                // if(pointer[keys[0]] === undefined) {
                                //     Vue.set(pointer, keys[0], el.getAttribute('false-value'));
                                // }else{
                                //     pointer[keys[0]] = el.getAttribute('false-value');
                                // }
                                pointer[keys[0]] = el.getAttribute(
                                    "false-value"
                                );
                            }
                        } else {
                            pointer[keys[0]] = $(this).val();
                        }
                    }
                }
            }
        });
    },
    update: function (el, binding, vnode) {
        $(el).iCheck("update");
    },
});
/*
Vue.component("chosen-select",{
    props:{
        value: [String, Array],
        multiple: Boolean
    },
    template: '<select :multiple="multiple"><slot></slot></select>',
    mounted : {
        $(this.$el)
            .val(this.value)
            .chosen()
            .on("change", e => this.$emit('input', $(this.$el).val()))
    },
    watch:{
        value(val){
            $(this.$el).val(val).trigger('chosen:updated');
        }
    }
})*/

/**
 * input[text] tag에 number 만 입력하게 하는 directive
 * v-digitonly.number : 0~9 만 입력 가능
 * v-digitonly.number.alpha: 숫자, a~z, A~Z 입력 가능
 * v-digitonly.number.decimal: 숫자, 점(키보드[.] 그리고 키패드[.]) 입력 가능
 */
Vue.directive("digitonly", function (el, binding) {
    el.addEventListener("keydown", function (e) {
        // delete, backpsace, tab, escape, enter
        var special = [46, 8, 9, 27, 13];
        if (binding.modifiers["decimal"]) {
            // decimal(numpad), period
            special.push(110, 190);
        }
        // special from above
        if (
            special.indexOf(e.keyCode) !== -1 ||
            // Ctrl+A
            (e.keyCode === 65 && e.ctrlKey === true) ||
            // Ctrl+C
            (e.keyCode === 67 && e.ctrlKey === true) ||
            // Ctrl+X
            (e.keyCode === 88 && e.ctrlKey === true) ||
            // Ctrl+V
            (e.keyCode === 86 && e.ctrlKey === true) ||
            // home, end, left, right
            (e.keyCode >= 35 && e.keyCode <= 39)
        ) {
            return; // allow
        }
        if (
            binding.modifiers["alpha"] &&
            // a-z/A-Z
            e.keyCode >= 65 &&
            e.keyCode <= 90
        ) {
            return; // allow
        }
        if (
            binding.modifiers["number"] &&
            // number keys without shift
            ((!e.shiftKey && e.keyCode >= 48 && e.keyCode <= 57) ||
                // numpad number keys
                (e.keyCode >= 96 && e.keyCode <= 105))
        ) {
            return; // allow
        }
        // otherwise stop the keystroke
        e.preventDefault(); // prevent
    }); // end addEventListener
});

function getCurrencyByCountryCode(countryCode) {
    if (countryCode == "") return "";
    for (i = 0; i < _COUNTRY.length; i++) {
        if (_COUNTRY[i].value == countryCode) {
            return _COUNTRY[i].currency;
        }
    }
    return "";
}

function getCurrencyByCurrencyCode(currencyCode) {
    if (currencyCode == "") return "";
    for (i = 0; i < _CURRENCIES.length; i++) {
        if (_CURRENCIES[i].code == currencyCode) {
            return _CURRENCIES[i].sign;
        }
    }
    return "";
}

var CommonUtil = {
    data: {
        maxLen: {
            rank: "6",
            float: "8",
            number: "14",
            bizno: "12",
            telno: "13",
            sname: "20",
            mname: "50",
            lname: "100",
            addr: "200",
            desc: "500",
            memo: "1000",
        },
        maskCfg: {
            masks: {
                br: "###-##-#####",
                hp: "###T###TT####",
                tp: "##TT##TTT####",
                ba: "#TTTTTTTTTTTTTT###",
            },
            tokens: {
                "#": { pattern: /[0-9]/ },
                T: { pattern: /[0-9\-]/ },
            },
        },
        vmFormat: {
            money: {
                decimal: ".",
                thousands: ",",
                prefix: " ",
                suffix: " ",
                precision: 0,
                masked: false,
            },
            float: {
                decimal: ".",
                thousands: "",
                prefix: " ",
                suffix: " ",
                precision: 2,
                masked: false,
            },
            number: {
                decimal: ".",
                thousands: "",
                prefix: " ",
                suffix: " ",
                precision: 0,
                masked: false,
            },
        },
    },
    methods: {
        limitCharSize: function (valueStr, limitLen) {
            return this.limitCharSize(valueStr, limitLen, null);
        },
        limitCharSize: function (valueStr, limitLen, $event) {
            if (String(valueStr).length > limitLen) {
                Swal.alert([
                    $.t("common.valid.input.length", { 0: limitLen }),
                    "warning",
                ]);
                valueStr = String(valueStr).substring(0, limitLen);
                if ($event) {
                    $event.target.value = valueStr;
                }
            }
            return valueStr;
        },
        limitByteSize: function (valueStr, limitByte) {
            return this.limitCharSize(valueStr, limitByte, null);
        },
        limitByteSize: function (valueStr, limitByte, $event) {
            var mbytes = 0;
            for (i = 0; i < String(valueStr).length; i++) {
                var ch = String(valueStr).charAt(i);
                if (escape(ch).length > 4) {
                    mbytes += 2;
                } else if (ch == "\n") {
                    if (String(valueStr).charAt(i - 1) != "\r") {
                        mbytes += 1;
                    }
                } else {
                    mbytes += 1;
                }
                if (mbytes > limitByte) {
                    valueStr = String(valueStr).substr(0, i);
                    if ($event) {
                        $event.target.value = valueStr;
                    }
                    Swal.alert([
                        $.t("common.valid.input.length.byte", { 0: limitByte }),
                        "warning",
                    ]);
                    break;
                }
            }
            return valueStr;
        },
        openPopupCenter: function (openUrl, title, width, heigth) {
            window.open(
                openUrl,
                title,
                "width=" +
                    width +
                    ",height=" +
                    heigth +
                    ",top=" +
                    (screen.height - heigth) / 2 +
                    ",left=" +
                    (screen.width - width) / 2 +
                    ",scrollbars=yes,status=no"
            );
        },
        selectSrchSiteList: function () {
            if (
                this.searchParam.siteCd === undefined ||
                this.siteList === undefined
            ) {
                return;
            }

            // 사이트 목록
            var userSiteList = SessionUtil.getUserSiteList();
            for (var i = 0; i < userSiteList.length; i++) {
                this.siteList.push({
                    value: userSiteList[i].siteCd,
                    text: userSiteList[i].siteNm,
                });
            }

            // 첫번째 옵션 선택
            if (this.siteList.length > 0) {
                this.searchParam.siteCd = this.siteList[0].value;
            }

            // 1개일 경우 비활성화
            if (this.siteList.length === 1) {
                this.$refs.srchSiteCd.disabled = true;
            }
        },
        selectPostSiteList: function () {
            if (this.postParam.siteCd === undefined) {
                return;
            }

            // 첫번째 옵션 선택
            if (this.siteList.length > 0) {
                this.postParam.siteCd = this.siteList[0].value;
            }

            // 1개일 경우 비활성화
            if (this.siteList.length === 1) {
                this.$refs.postSiteCd.disabled = true;
            }
        },
        disablePostSiteList: function () {
            if (this.postParam.siteCd === undefined) {
                return;
            }

            // 1개일 경우 비활성화
            if (this.siteList.length === 1) {
                this.$refs.postSiteCd.disabled = true;
            }
        },
    },
};
