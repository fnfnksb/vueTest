var bulletinDetail = null;
bulletinDetail = new Vue({
    el: "#bulletinDetail",
    data: {
        postParam: {
            bltnClCd: "",
            postNo: 0,
            siteCd: "1",
            dvcTypCd: "001",
            dispYn: "Y",
            topYn: "N",
            upDispYn: "N",
            dispStartDt: "",
            strDt: "",
            strHr: "00",
            strMi: "00",
            dispEndDt: "",
            endDt: "",
            endHr: "23",
            endMi: "59",
            postTypCd: "",
            postTitl: "",
            postCtnt: "",
            uploadImage: null,
            imgUrl: "",
            imgPath: "",
            imgNm: "",
            imgAlt: "",
            createNm: "",
            createDt: "",
            updateNm: "",
            updateDt: "",
        },
        siteList: [],
        deviceList: [],
        postTypCdList: [],
        modalRegister: true,
        titles: { SY047: "FAQ", SY048: "공지사항" }, // 타이틀
        hrList: [], // 시간 목록
        miList: [], // 분 목록,
        top10Cnt: "", // 전체 top10의 갯수
        originTopYn: "", // 기존 top10여부

        datePickerOptionsStr: {
            //format: dateFormatPattern + ' hh:ii',
            format: dateFormatPattern,
            autoclose: true,
            todayHighlight: true,
            language: "ko",
            //minuteStep: 1,
            pickerPosition: "bottom-left",
            calendarWeeks: true,
            todayBtn: "linked",
            keyboardNavigation: false,
            forceParse: false,
            useCurrent: true,
        },

        datePickerOptionsEnd: {
            //format: dateFormatPattern + ' hh:ii',
            format: dateFormatPattern,
            autoclose: true,
            todayHighlight: true,
            language: "ko",
            //minuteStep: 1,
            pickerPosition: "bottom-left",
            calendarWeeks: true,
            todayBtn: "linked",
            keyboardNavigation: false,
            forceParse: false,
            useCurrent: true,
        },
    },
    methods: {
        getAllCommonCodeLists: function () {
            getCommonCodeList("DI199", bulletinDetail.siteList); // 사이트 코드
            getCommonCodeList("DP030", bulletinDetail.deviceList); // 디바이스 코드
            getCommonCodeList(
                bulletinDetail.postParam.bltnClCd,
                bulletinDetail.postTypCdList
            ); // bulletin 종류별 post 분류 코드
        },
        getPost: function (postNo) {
            $.ajax({
                type: "get",
                url: "/system/rest/posts/" + postNo,
                success: function (response) {
                    var result = "";
                    var $this = this;
                    var topYn = response.data.result.topYn;
                    bulletinDetail.topYn(topYn);
                    if (response.data) result = response.data.result;
                    if (WebUtil.isNull(result)) {
                        Swal.alert([
                            "게시물 정보를 불러올 수 없습니다.",
                            "warning",
                        ]).then(function () {
                            window.self.close();
                        });
                    } else {
                        //bulletinDetail.postParam = result;
                        var param = bulletinDetail.postParam;
                        for (data in result) {
                            param[data] = result[data];
                            $("#editor").summernote("code", result.postCtnt);
                            //delete param['updateNo'];
                            //delete param['createNo'];
                            //console.log(param[data]);
                        }

                        // 일자/시 정보 분리
                        var startDate = moment(
                            param.dispStartDt,
                            dateFormatPattern.toUpperCase() + " HH:mm"
                        );
                        var endDate = moment(
                            param.dispEndDt,
                            dateFormatPattern.toUpperCase() + " HH:mm"
                        );

                        if (startDate.isValid()) {
                            param.strDt = startDate
                                .format(dateFormatPattern.toUpperCase())
                                .toString();
                            param.strHr = startDate.format("HH").toString();
                            param.strMi = startDate.format("mm").toString();
                        }

                        if (endDate.isValid()) {
                            param.endDt = endDate.format(
                                dateFormatPattern.toUpperCase()
                            );
                            param.endHr = endDate.format("HH").toString();
                            param.endMi = endDate.format("mm").toString();
                            /*param.endHr = endDate.hour();
                            param.endMi = endDate.minute();*/
                        }

                        // 현재 설정된 기간 정보로 업데이트 처리...
                        Vue.nextTick(function () {
                            /*$("#dispStrDtTimepicker").datetimepicker("setEndDate", param.dispEndDt);
                            $("#dispStrDtTimepicker").datetimepicker("update", param.dispStartDt);
                            $("#dispEndDtTimepicker").datetimepicker("setStartDate", param.dispStartDt);
                            $("#dispEndDtTimepicker").datetimepicker("update", param.dispEndDt);*/

                            $("#dispStrDtTimepicker").datepicker(
                                "setEndDate",
                                param.endDt
                            );
                            $("#dispStrDtTimepicker").datepicker(
                                "update",
                                param.strDt
                            );
                            $("#dispEndDtTimepicker").datepicker(
                                "setStartDate",
                                param.strDt
                            );
                            $("#dispEndDtTimepicker").datepicker(
                                "update",
                                param.endDt
                            );

                            bulletinDetail.initFileInput();
                        });
                    }
                },
            });
        },
        insertPost: function () {
            if (!bulletinDetail.checkValid()) {
                return;
            }
            bulletinDetail.postParam.postCtnt = $("#editor").summernote("code");
            $.ajax({
                type: "post",
                url: "/system/rest/posts",
                cache: false,
                contentType: false,
                processData: false,
                //data: bulletinDetail.postParam,
                data: objectToFormData(bulletinDetail.postParam),
                success: function (response) {
                    if (response.resultStatus.status) {
                        Swal.alert(["등록되었습니다.", "success"]).then(
                            function () {
                                bulletinDetail.closePostDetail();
                            }
                        );
                    } else {
                        Swal.alert([response.resultStatus.message, "error"]);
                    }
                },
            });
        },
        updatePost: function () {
            if (!bulletinDetail.checkValid()) {
                return;
            }

            bulletinDetail.postParam.postCtnt = $("#editor").summernote("code");
            $.ajax({
                type: "post",
                url: "/system/rest/posts/" + bulletinDetail.postParam.postNo,
                cache: false,
                contentType: false,
                processData: false,
                //data: bulletinDetail.postParam,
                data: objectToFormData(bulletinDetail.postParam),
                success: function (response) {
                    if (response.resultStatus.status) {
                        Swal.alert(["변경되었습니다.", "success"]).then(
                            function () {
                                bulletinDetail.closePostDetail();
                            }
                        );
                    } else {
                        Swal.alert([response.resultStatus.message, "error"]);
                    }
                },
            });
        },
        selectTop1oCnt: function () {
            var $this = this;
            $.ajax({
                type: "get",
                url: "/system/rest/posts/getTopCnt",
                success: function (response) {
                    $this.top10Cnt = response;
                },
            });
        },
        topYn: function (topYn) {
            this.originTopYn = topYn;
        },
        checkValid: function () {
            var $this = this;

            var param = bulletinDetail.postParam;
            var maxLen = bulletinDetail.maxLen;
            // 일자 + 시 + 분
            param.dispStartDt = "";
            param.dispEndDt = "";
            if (param.strDt !== "") {
                param.dispStartDt =
                    param.strDt + " " + param.strHr + ":" + param.strMi;
            }
            if (param.endDt !== "") {
                param.dispEndDt =
                    param.endDt + " " + param.endHr + ":" + param.endMi;
            }

            //var startDate = moment(new Date());
            var startDate = moment(
                param.dispStartDt,
                dateFormatPattern.toUpperCase() + " HH:mm"
            );
            var endDate = moment(
                param.dispEndDt,
                dateFormatPattern.toUpperCase() + " HH:mm"
            );

            // 시작/종료일시 둘 다 정상 입력되었을 경우...
            var duration = 0;
            if (startDate.isValid() && endDate.isValid()) {
                duration = endDate.diff(startDate);
                //var duration = endDate.diff(startDate, 'days');
            }

            if (WebUtil.isNull(param.siteCd)) {
                Swal.alert(["사이트를 선택해주세요.", "warning"]);
                return false;
            }

            if (WebUtil.isNull(param.dvcTypCd)) {
                Swal.alert(["디바이스를 선택해주세요.", "warning"]);
                return false;
            }

            if (duration < 0) {
                Swal.alert([
                    "종료일시가 시작일시보다 이전입니다.\n날짜와 시간을 다시 확인해주세요.",
                    "warning",
                ]).then(function () {
                    //document.getElementById("strDt").focus();
                    var offset = $("#dispStrDtTimepicker").offset();
                    $("html").animate({ scrollTop: offset.top - 100 }, 400);
                });
                return false;
            }

            if (WebUtil.isNull(param.postTypCd)) {
                Swal.alert(["분류를 선택해주세요.", "warning"]);
                return false;
            }

            if (!validChecker(param.postTitl, "mxlen", maxLen.addr)) {
                Swal.alert([
                    "질문/제목의 길이가 유효하지 않습니다.",
                    "warning",
                ]);
                return false;
            }

            /*if(!validChecker(param.postCtnt, 'mxlen', maxLen.memo)) {
                Swal.alert(['내용의 길이가 유효하지 않습니다.', 'warning']);
                return false;
            }*/

            if (
                param.topYn == "Y" &&
                $this.top10Cnt > 9 &&
                $this.originTopYn != "Y"
            ) {
                Swal.alert([
                    "이미 10개의 질문이 TOP10으로 등록 되어있습니다.",
                    "warning",
                ]);
                return false;
            }

            return true;
        },
        initFileInput: function () {
            var fileSize = 3072; //3MB
            /*$("#uploadImage").fileinput($.extend(true, {}, commonFileInputOptions(1, fileSize, ["jpg", "gif", "png"]), {
                showPreview:fale,
                initialCaption:$.t('seller.img.noti'),
                msgPlaceholder:$.t('seller.img.noti'),
                msgNoFilesSelected:$.t('seller.img.noti'),
                elErrorContainer: '#kv-error-main'
            })).on("filecleared", function(event) {
                bulletinDetail.postParam.uploadImage = null;
            }).on("fileloaded", function(event, file, previewId, index, reader) {
                bulletinDetail.postParam.uploadImage = file;
                console.log(bulletinDetail.postParam.uploadImage);
            });*/

            // 미리보기 이미지
            var prevImgList = [];
            if (WebUtil.isNotNull(this.postParam.imgNm)) {
                // /th120_
                prevImgList = [
                    '<img src="' +
                        uploadUrl +
                        this.postParam.imgUrl +
                        "/" +
                        GblVar.thumSmlSiz +
                        this.postParam.imgNm +
                        '" alt="' +
                        this.postParam.imgAlt +
                        '" class="kv-preview-data file-preview-image" onerror="this.src=\'/img/no_img_256x256.png\';" />',
                ];
            }

            // 미리보기 이미지 설정
            var prevImgConfList = [
                {
                    type: "image",
                    key: 0,
                    caption: this.postParam.imgNm,
                    //size: this.postParam.imgSize,
                    url: "/product/rest/productRegister/removePrdImg",
                },
            ];

            // 이미지 생성
            $("#uploadImage").fileinput("destroy").off();
            $("#uploadImage")
                .fileinput(
                    $.extend(
                        true,
                        {},
                        commonFileInputOptions(1, fileSize, [
                            "jpg",
                            "png",
                            "gif",
                        ]),
                        {
                            elErrorContainer: "#kv-error-main",
                            browseOnZoneClick: true,
                            showBrowse: false,
                            showRemove: false,
                            showCaption: false,
                            overwriteInitial: false,
                            validateInitialCount: true,
                            initialPreview: prevImgList,

                            /*initialCaption:$.t('seller.img.noti'),
                msgPlaceholder:$.t('seller.img.noti'),
                msgNoFilesSelected:$.t('seller.img.noti'),*/

                            initialPreviewAsData: false,
                            initialPreviewFileType: "image",
                            initialPreviewConfig: prevImgConfList,
                            layoutTemplates: {
                                caption: "",
                                actionDrag: "",
                                actionUpload: "",
                                //, actionZoom: ""
                            },
                            uploadUrl: "/",
                        }
                    )
                )
                .on("filecleared", function (event) {
                    //console.log('filecleared');
                    bulletinDetail.postParam.uploadImage = null;
                })
                .on("fileloaded", function (
                    event,
                    file,
                    previewId,
                    index,
                    reader
                ) {
                    //console.log('fileloaded');
                    bulletinDetail.postParam.uploadImage = file;
                    bulletinDetail.postParam.imgNm = "";
                    //console.log('bulletinDetail.postParam.oldImgNm : ' + bulletinDetail.postParam.oldImgNm);
                    //console.log('bulletinDetail.postParam.imgNm : ' + bulletinDetail.postParam.imgNm);
                })
                .on("fileremoved", function (event, id, index) {
                    //console.log('fileremoved');
                    bulletinDetail.postParam.uploadImage = null;
                    bulletinDetail.postParam.oldImgNm =
                        bulletinDetail.postParam.imgNm;
                    bulletinDetail.postParam.imgNm = "DELETE";
                    //console.log('bulletinDetail.postParam.oldImgNm : ' + bulletinDetail.postParam.oldImgNm);
                    //console.log('bulletinDetail.postParam.imgNm : ' + bulletinDetail.postParam.imgNm);
                })
                .on("filedeleted", function (event, key) {
                    //console.log('filedeleted');
                    bulletinDetail.postParam.uploadImage = null;
                    bulletinDetail.postParam.oldImgNm =
                        bulletinDetail.postParam.imgNm;
                    bulletinDetail.postParam.imgNm = "DELETE";
                    //console.log('bulletinDetail.postParam.oldImgNm : ' + bulletinDetail.postParam.oldImgNm);
                    //console.log('bulletinDetail.postParam.imgNm : ' + bulletinDetail.postParam.imgNm);
                    $("#uploadImage").fileinput("clear");
                });
        },
        closePostDetail: function () {
            if (
                typeof window.opener[bulletinDetail.callVueName]
                    .dispPostDetailCallback === "function"
            ) {
                window.opener[
                    bulletinDetail.callVueName
                ].dispPostDetailCallback();
            }
            window.self.close();
        },
        // datepicker 초기화/변경정보 설정...
        initDatepicker: function () {
            var $this = this;
            Vue.nextTick(function () {
                //$("#dispStrDtTimepicker").datetimepicker($this.datePickerOptionsStr).on("changeDate", function () {
                $("#dispStrDtTimepicker")
                    .datepicker($this.datePickerOptionsStr)
                    .on("changeDate", function () {
                        // DatePicker 에서 입력된 값을 Vue model 에 저장.
                        $this.postParam.strDt = $("#strDt").val();
                        // 시작일시가 설정된 경우 종료일시의 시작일 정보 업데이트
                        $("#dispEndDtTimepicker").datepicker(
                            "setStartDate",
                            $("#strDt").val()
                        );
                    });

                //$("#dispEndDtTimepicker").datetimepicker($this.datePickerOptionsEnd).on("changeDate", function () {
                $("#dispEndDtTimepicker")
                    .datepicker($this.datePickerOptionsEnd)
                    .on("changeDate", function () {
                        // DatePicker 에서 입력된 값을 Vue model 에 저장.
                        $this.postParam.endDt = $("#endDt").val();
                        // 종료일시가 설정된 경우 시작일시의 종료일 정보 업데이트
                        $("#dispStrDtTimepicker").datepicker(
                            "setEndDate",
                            $("#endDt").val()
                        );
                    });
            });
        },
        /**
         * 시간 목록 구하기
         */
        setHourList: function () {
            //var resultList = [];
            var m = 0;
            var hour = "";

            for (m = 0; m <= 23; m++) {
                if (m < 10) {
                    hour = "0" + m;
                } else {
                    hour = m + "";
                }

                bulletinDetail.hrList.push({
                    value: hour,
                    text: hour + "시",
                });
            }
        },

        /**
         * 분 목록 구하기
         */
        setMinuteList: function () {
            //var resultList = [];
            var m = 0;
            var mint = "";

            for (m = 0; m <= 59; m++) {
                if (m < 10) {
                    mint = "0" + m;
                } else {
                    mint = m + "";
                }

                bulletinDetail.miList.push({
                    value: mint,
                    text: mint + "분",
                });
            }
        },
        initEditor: function () {
            var $this = this;
            $(".summernote")
                .summernote({
                    height: 150,
                    lang: "ko-KR",
                    toolbar: [
                        //['Paragraph style', ['style']],
                        ["style", ["bold", "italic", "underline"]],
                        //['Font Style', ['fontname']],
                        ["fontsize", ["fontsize"]],
                        ["color", ["color"]],
                        ["para", ["ul", "ol", "paragraph"]],
                        //['Insert', ['picture','table','video']],
                        ["Misc", ["fullscreen", "codeview"]],
                        ["view", ["codeview"]],
                    ],
                })
                .on("summernote.change", function (we, contents, $editable) {
                    console.log("tt : " + contents);
                    $this.postParam.postCtnt = contents;
                });

            $(".summernote").summernote("code", $this.postParam.postCtnt);
        },
    },

    mixins: [CommonUtil],
    updated: function () {},
    computed: {
        imgFullNm: function () {
            return this.postParam.imgUrl + "/th120_" + this.postParam.imgNm;
        },
    },
    mounted: function () {
        var self = this;
        $(document).ready(function () {
            self.postParam.bltnClCd = getParameters("bltnClCd");

            // 상단 타이틀 처리...
            document.title =
                "고객센터 > " + self.titles[self.postParam.bltnClCd] + " 등록";
            self.getAllCommonCodeLists();
            self.initDatepicker();
            self.setHourList(); // 시간 구하기
            self.setMinuteList(); // 분 구하기

            self.mode = getParameters("mode");
            self.callVueName = getParameters("callVueName");
            var postNoParam = getParameters("postNo");
            var postNo = self.mode == "UD" ? Number(postNoParam) : 0;
            self.postParam.postNo = postNo;
            self.selectTop1oCnt();
            if (WebUtil.isNull(self.mode) || WebUtil.isNull(self.callVueName)) {
                return Swal.alert(["잘못된 팝업 호출입니다.", "warning"]).then(
                    function () {
                        window.self.close();
                    }
                );
            }
            if (self.mode == "UD" && postNo > 0) {
                self.getPost(postNo);
                self.modalRegister = false;
            } else {
                self.initFileInput();
            }

            self.initEditor();
        });
    },
});
