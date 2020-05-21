var spinner = null;
var spinner_div = 0;

var ladda_button_div = null;
var isLoading = false;

//$(function(){
	spinner_div = $('#spinner').get(0);
//});

/**
* 공통 ajax error 처리.
*/
function ajaxErrorHandle(response) {
	try {
		var jsonData = response;
     	if(typeof response !== 'object') {
     		jsonData = JSON.parse(response);
     	}

     	console.log('jsonData.resultStatus : ' + jsonData.resultStatus);
        console.log('jsonData.resultStatus.status : ' + jsonData.resultStatus.status);

 		// success 여부에 따른 처리(resultStatus == true => success, false => fail)
    	 	if(jsonData.resultStatus && !jsonData.resultStatus.status) {
    		 	Swal.alert([jsonData.resultStatus.message, "error"])
//    		 	.then(() => {
//    			 	// Unauthorized 일 경우...
//    			 	if(jsonData.resultStatus.code == 401) {
//    				 	//location.reload();
//    					// 인증 오류 일 경우 로그인 페이지로 유도 처리(parent reload)
//    				 	parentReload();
//    			 	}
//    		 	});
    		 	.then(function(value){
    		 		// Unauthorized 일 경우...
    			 	if(jsonData.resultStatus.code == 401) {
    				 	//location.reload();
    					// 인증 오류 일 경우 로그인 페이지로 유도 처리(parent reload)
    				 	parentReload();
    			 	}
				});
    		 	return false;
    	 	} else {
    	 		Swal.alert([$.t('error.common'), "error"])
    	 	}
 		return true;
 	} catch(ex) {
		console.log(ex.toString());
 		Swal.alert([$.t('error.common'), "error"])
 	}
}

/**
 * Ajax default options
 */
$.ajaxSetup({
    dataType: "json",
    //type: "POST",
    //contentType: "application/x-www-form-urlencoded;charset=utf-8",
    headers : {"cache-control" : "no-cache", "pragma" : "no-cache"},
    beforeSend: function (jqXHR, settings) {
        if (spinner == null) {
            spinner = new Spinner(spinnerOpts).spin(spinner_div);
        } else {
            spinner.spin(spinner_div);
        }

        if(ladda_button_div) {
        	l = ladda_button_div.ladda();
        	l.ladda( 'start' );
        }

        $('#wrapper-content').children('.ibox-content').toggleClass('sk-loading');
		isLoading = true;

		if (settings.dataType === 'binary'){
			//settings.xhr().responseType = 'arraybuffer';
            jqXHR.responseType = 'blob';
		    settings.processData=false;
		}

        startTime = new Date().getTime();
        //console.log('startTime : ' + (startTime)/1000);
    },
    complete: function (event) {
    	try {
    		endTime = new Date().getTime();
            // console.log('Elapse time : ' + (endTime - startTime)/1000);
            if(isLoading) {
            	$('#wrapper-content').children('.ibox-content').toggleClass('sk-loading');
            }
    		isLoading = false;

            spinner.stop(spinner_div);
            if(ladda_button_div && l) {
            	l.ladda('stop');
            	ladda_button_div = null;	// init null
            }
    	} catch(ex){
    	}

    },
    success: function (event) { },
    // Common Error Handling
    error : function(xhr, status, error) {
    	console.log(error);
		ajaxErrorHandle(xhr.responseJSON);
	}
});



/**
 * Spinner Options
 */
var spinnerOpts = {
    lines: 13, // The number of lines to draw
    length: 16, // The length of each line
    width: 8, // The line thickness
    radius: 20, // The radius of the inner circle
    corners: 1, // Corner roundness (0..1)
    rotate: 0, // The rotation offset
    direction: 1, // 1: clockwise, -1: counterclockwise
    color: '#000', // #rgb or #rrggbb or array of colors
    speed: 1.1, // Rounds per second
    trail: 60, // Afterglow percentage
    shadow: false, // Whether to render a shadow
    hwaccel: false, // Whether to use hardware acceleration
    className: 'spinner', // The CSS class to assign to the spinner
    zIndex: 2e9, // The z-index (defaults to 2000000000)
    top: '50%', // Top position relative to parent
    left: '50%', // Left position relative to parent
    position: 'fixed'
};

//Here we set the altRows option globally
$.extend($.jgrid.defaults, { rowNum: 30 });

/**
 * jQgrid set options globally
 */
var objectWithGridOptions = {
		datatype: "json",
		height: 300,
		autowidth: true,
        shrinkToFit: true,
        rowNum: 20,
        rowList: [10, 20, 30],
        recordtext: "View {0} ~ {1} of {2}",
		// 정상 Server Response 일 경우 아래 옵션을 처리해야 jqgrid 내부에서 Model Mapping 일 정상 처리됨.
        jsonReader: {
        	root: 'data.result'
        	,records: 'data.totalCount'
            ,total: function (obj) {
				var totalPage = 0;
          		if(obj.data) {
            		totalPage = Math.ceil(obj.data.totalCount / obj.data.rowCount);
            	}
            	return totalPage
            }
            ,page: 'data.currentPage'
        },
        // Server Exception Handling
        loadError: function(xhr, status, error) {
        	ajaxErrorHandle(xhr.responseJSON);
        },
        cmTemplate: {sortable: false},
        pager: "#pager_list",
        viewrecords: true,
        hidegrid: false,
        loadonce: false
};

var commonGridOptions = function(rowNumParam, loadonceParam) {
	var rowNum = 30;
	var loadonce = false;
	if(rowNumParam) {
		rowNum = rowNumParam;
	}

	if(loadonceParam) {
		loadonce = loadonceParam;
	}

	return {
		datatype: "json",
		height: 400,
		autowidth: true,
	    shrinkToFit: true,
        autoencode: false,
	    rowNum: rowNum,
        rowList: [ 30, 50, 100, 300 ],
	    //recordtext: "View {0} ~ {1} of {2}",
	    recordtext: $.t('common.page.recordtext', {0:'{0}', 1:'{1}', 2:'{2}'}),
        page: 0,
		// 정상 Server Response 일 경우 아래 옵션을 처리해야 jqgrid 내부에서 Model Mapping 일 정상 처리됨.
	    jsonReader: {
	    	root: 'data.result'
	    	,records: 'data.totalCount'
	        ,total: function (obj) {
				var totalPage = 0;
	      		if(obj.data) {
	        		totalPage = Math.ceil(obj.data.totalCount / obj.data.rowCount);
	        	}

	      		if(obj.data.totalCount > 0)
	        		return totalPage
	        }
	        ,page: 'data.currentPage'
	    },
        loadui: 'disable',
        beforeRequest: function() {
            startTime = new Date().getTime();
            // console.log('startTime : ' + (startTime)/1000);
			if ($(this).jqGrid("getGridParam", "datatype") == "json") {
	            if (spinner == null) {
	                spinner = new Spinner(spinnerOpts).spin(spinner_div);
	            } else {
	                spinner.spin(spinner_div);
	            }
        	}
        },
        loadComplete: function() {
            // spinner.stop(spinner_div);
        },
	    // Server Exception Handling
	    loadError: function(xhr, status, error) {
            spinner.stop(spinner_div);
	    	ajaxErrorHandle(xhr.responseJSON);
	    },
	    cmTemplate: {sortable: false},
	    pager: "#pager_list",
	    viewrecords: true,
	    hidegrid: false,
	    loadonce: loadonce,
		gridview: true,	// true 설정 시 grid 속도 3~5배 향상됨. 단, treeGrid, subGrid 또는 afterInsertRow 이벤트를 사용할 수 없습니다.
	}
};

/**
 * Server Response를 처리 후 정상일 경우 jstree 에 맞게 data filtering
 */
function jstreeDataFilter(response) {
	var jsonData = JSON.parse(response);
	if(jsonData.data) {
		return JSON.stringify(jsonData.data.result);
	}
	return response;
}

/**
 * Function for resize the grid according to the width of the resized window
 * @param string grid_id - jqGrid id used in current page
 * @param string div_id - parent div_id according to whom it will need to resize
 * @param string width - width of the grid that has been set during initialize the grid setup
 * @returns void
 */
function resizeJqGridWidth(grid_id, div_id, width, shrinkToFit) {
	if (typeof(shrinkToFit) === 'undefined') {
		shrinkToFit = true;
	}
	$(window).bind('resize', function() {
		$('#' + grid_id).setGridWidth(width, shrinkToFit); //Back to original width
		//console.log($('#' + div_id).width());
		$('#' + grid_id).setGridWidth($('#' + div_id).width(), shrinkToFit); //Resized to new width as per window
	}).trigger('resize');
}

$(document).ready(function() {
	$('.modal-dialog').draggable({
		handle: ".modal-header"
	});
});

/**
 * modal close 시 confirm 처리
 * modal show 시 또는 close 시 Init callback 처리.
 * @param modalObj, default
 * @param callback, default
 * @param keyboard true/false, optional
 * @param backdrop true/false/static, optional
 */
function confirmCloseModal(modalObj, callback, keyboard, backdrop) {
	modalObj.on("show.bs.modal", function (e) {
		if(keyboard != undefined) modalObj.data('bs.modal').options.keyboard = keyboard;
		if(backdrop != undefined) modalObj.data('bs.modal').options.backdrop = backdrop;

		modalObj.data('bs.modal').options.backdrop = 'static';
		//closeModal(modalObj);
		//callback();	// Modal Hide 시 Model data 초기화 할 경우

		// Modal Show 시 Model data 초기화 할 경우
		//callback();
		var isPreventing = false;
		modalObj.on("hide.bs.modal", function (e) {
			closeModal(modalObj);
			callback();

			/*e.preventDefault();
			//if ($(".sweet-alert.visible").length <= 0) {
			if (!isPreventing) {
				setTimeout(function() {
					Swal.confirm([$.t('common.confirm.dialog.close'), 'warning'])
					.then(function(value){
						isPreventing = false;
						if (value) {
							closeModal(modalObj);
							callback();	// Modal Hide 시 Model data 초기화 할 경우
						}
					});
				}, 300);
			}
			isPreventing = true;*/
		});
	});
}

/**
 * remove event listener & hide modal
 */
function closeModal(modalObj) {
	modalObj.off("hide.bs.modal", null);
	modalObj.modal('hide');
}

/**
 * totalCount
 * endPage
 * rowCount
 * currentPage
 */
function onPagingCommon(pageData, gridObj, callback) {
	var currentPage = $(gridObj).getGridParam("page");
	var endPage = $(gridObj).getGridParam("lastpage");
	var rowCount = $(gridObj).getGridParam("rowNum");
	var pager = $(gridObj).getGridParam("pager");
    var currentIndex = 0;
	//console.log($(gridObj).jqGrid('getGridParam'));
    //console.log($(gridObj));
    //console.log($(pager));
    //console.log($(pager + " .ui-pg-selbox").val());
	//console.log(pageData);

	if(pageData == "user") {
		var num = $(pager + " .ui-pg-input").val().replace(/[^0-9]/g, '');
		if(num != 0 && num <= endPage) {
			currentPage = Number(num.replace(/^[0]+/g, ''));
		}
		//console.log(typeof currentPage);
	} else if(pageData.startsWith('first_')) {
		currentPage = 1;
	} else if(pageData.startsWith('prev_')) {
		if(currentPage > 1) currentPage -= 1;
	} else if(pageData.startsWith('next_')) {
		if(currentPage < endPage) currentPage += 1;
	} else if(pageData.startsWith('last_')) {
		currentPage = endPage;
	} else if(pageData == "records") {
		rowCount = $(pager + " .ui-pg-selbox").val();
		currentPage = 1;
	}
	currentIndex = (currentPage - 1) * rowCount;
	var result = {"endPage": endPage, "currentPage": currentPage, "rowCount": rowCount, "currentIndex": currentIndex};
	callback(result);
}

/**
 * Infinite Scroll...
 *
 * @param gridObj
 * @param callback
 */
function beforeRequestCommon(gridObj, callback) {
    var p = $(gridObj).jqGrid("getGridParam");
    var currentPage = p.page;
    var rowCount = p.rowNum;
    var currentIndex = 0;
    if(currentPage > 0) {
        currentIndex = (currentPage - 1) * rowCount;
	}
    //console.log('currentPage : ' + currentPage + ', rowCount : ' + rowCount + ', currentIndex : ' + currentIndex);

    var result = {"currentPage": currentPage, "rowCount": rowCount, "currentIndex": currentIndex};
    callback(result, p);

    // Stop Watch
    startTime = new Date().getTime();
    console.log('startTime : ' + (startTime)/1000);
    if ($(gridObj).jqGrid("getGridParam", "datatype") == "json") {
        if (spinner == null) {
            spinner = new Spinner(spinnerOpts).spin(spinner_div);
        } else {
            spinner.spin(spinner_div);
        }
    }
}

/**
 * local sorting 사용 시 호출 공통 function
 * @param gridObj
 */
function onSortColCommon(gridObj) {
	var dataType = gridObj.getGridParam('datatype');
    gridObj.setGridParam({loadonce : true});
    // 그리드의 데이터를 가져와서 json sorting.
    //var obj = gridObj.jqGrid('getRowData');

    var rowNum = gridObj.getGridParam('rowNum');
    var currentPage = Number($(".ui-pg-input").val());	//gridObj.getGridParam('page');
    var allRecords = gridObj.getGridParam('records');
    var totalPages = parseInt((allRecords / rowNum) + 1);
    var lastPage = gridObj.getGridParam('lastpage');

    //console.log(currentPage + '/' + allRecords + '/' +lastPage);

    //gridObj.setGridParam({datatype: 'local', loadonce : true});
    //obj = userAccessHist.sortByKey(obj, index);
    // 그리드의 데이터를 clear하고 정렬된 json을 다시 세팅.
    //gridObj.clearGridData();
    gridObj.setGridParam({
            //data: obj,
            loadComplete: function(response) {
                var p = gridObj.jqGrid("getGridParam");
                p.page = currentPage;
				p.records = allRecords;
                //p.total = totalPages;
                p.lastpage = lastPage;

                this.updatepager(false, true);

                gridObj.setGridParam({datatype: 'local', loadonce : false});
                if(spinner) spinner.stop(spinner_div);

                /*console.log('datatype : ' + dataType);
                if(dataType != 'local') {
                    onSortColCommon(gridObj);
                }*/
            },
        }
    );//.trigger("reloadGrid");
    //gridObj.setGridParam({datatype: 'local', loadonce : false});
    // onSortCol 이벤트를 커스터마이징 했기 때문에 기존의 이벤트를 부르지 못하게 stop 처리.
    return 'stop';
}

//Convert object to FormData
function convertFormData(jsonObject) {
	var formData = new FormData();
	if(jsonObject) {
		//var formObject = jsonObject.value;
		var formObject = jsonObject;
		var formKey;
		for(var property in formObject) {
			if(formObject.hasOwnProperty(property)) {
				formKey = property;
			}
			formData.append(formKey, formObject[property]);
			//console.log("formKey : value => " + formKey + " : " + formObject[property]);
		}
	}

	return formData;
}

/**
 * Convert object to FormData include multiple files
 */
var objectToFormData = function(obj, form, namespace) {
	var fd = form || new FormData();
	var formKey;
	for(var property in obj) {
		if(obj.hasOwnProperty(property)) {
			if(namespace) {
				//formKey = namespace + '[' + property + ']';
				formKey = namespace;
			} else {
				formKey = property;
			}

			// if the property is an object, but not a File,
			// use recursivity.
			if(typeof obj[property] === 'object' && !(obj[property] instanceof File)) {
				objectToFormData(obj[property], fd, property);
			} else {
				// if it's a string or a File object
				fd.append(formKey, obj[property]);
				//console.log("formKey : value => " + formKey + " : " + obj[property]);
			}
		}
	}
	return fd;
};

/**
 * Set default init bootstrap-fileinput
 */
var commonFileInputOptions = function(maxCount, maxSize, allowExts) {
	var fLocale = '';
	if(locale == 'ko') {
		fLocale = 'kr';
	}

	if(locale == 'in') {
		fLocale = 'id';
	}

	// with plugin options
	return {
		language: fLocale,
		showUpload: false,
		showCaption: true,
        showRemove: true,

		dropZoneEnabled: true,	// dropZone 여부
		previewFileType:'any',	// 미리보기 타입 지정.
		showPreview: true,		// 미리보기 여부
		maxFileCount: maxCount,		// multiple 첨부파일 제한 갯수
	    mainClass: "input-group-sm",
	    allowedFileExtensions: allowExts,	// 허용된 확장자, ["jpg", "png", "gif"]
	    //allowedFileTypes: ["image", "video"],
	    maxFileSize: maxSize,		// 파일당 제한 사이즈
	    initialCaption: "업로드할 파일을 선택해 주세요.",	// 업무에 따른 다국어 처리 대상.
	    browseClass: "btn btn-success",	//
        browseLabel: "파일 선택",	// 업무에 따른 다국어 처리 대상.
        //browseIcon: "<i class=\"glyphicon glyphicon-picture\"></i> ",
        removeClass: "btn btn-danger",
        removeLabel: "파일 삭제",	// 업무에 따른 다국어 처리 대상.
        removeIcon: "<i class=\"glyphicon glyphicon-trash\"></i> ",
		layoutTemplates:{caption:'<div class="file-caption form-control {class}" tabindex="500">\n' +
	        '  <span class="file-caption-icon"></span>\n' +
	        '  <input class="file-caption-name" onkeydown="return false;" readonly="readonly" onpaste="return false;">\n' +
	        '</div>'
            ,modal: //'<div class="modal-dialog-wrap">\n' +
                '<div class="modal-dialog modal-lg" role="document" style="display : block;vertical-align : baseline;text-align : inherit;">\n' +
                '  <div class="modal-content" style="display: block;text-align:inherit;">\n' +
                '    <div class="modal-header" style="display : block;">\n' +
                '      <div class="kv-zoom-actions pull-right">{toggleheader}{fullscreen}{borderless}{close}</div>\n' +
                '      <h3 class="modal-title">{heading} <small><span class="kv-zoom-title"></span></small></h3>\n' +
                '    </div>\n' +
                '    <div class="modal-body">\n' +
                '      <div class="floating-buttons"></div>\n' +
                '      <div class="kv-zoom-body file-zoom-content"></div>\n' + '{prev} {next}\n' +
                '    </div>\n' +
                '  </div>\n' +
                '</div>\n' /*+
				</div>\n'*/
        }
        //uploadUrl: '/seller/uploadDocuments',	// 파일별 서버 업로드 시
	};
}

/**
 * 공통 코드 리스트 조회
 * @param grpCd : string code
 * @param arrayObject : display array(result)
 * @param callback, optional
 */
var getCommonCodeList = function(grpCd, arrayObject, callback) {
	return $.ajax({
		url: "/common/rest/getCodeList/" + grpCd,
		method: "GET",
		success: function(response) {
			var dataList = response.data.result;

			if (Array.isArray(arrayObject)) {
				var dataCnt = dataList.length;
				var m = 0;

				for (m = 0; m < dataCnt; m++) {
					arrayObject.push({
						value : dataList[m].value, 
						text  : dataList[m].text,
						desc  : dataList[m].dtlsCdDesc,
						cdVal1: dataList[m].cdVal1,
						cdVal2: dataList[m].cdVal2,
						cdVal3: dataList[m].cdVal3,
						cdVal4: dataList[m].cdVal4,
						cdVal5: dataList[m].cdVal5
					});
				}
			}

			if (typeof callback === "function") {
				callback(dataList);
			}
		}
	});
}

/**
 * URL 코드 리스트 조회 - 거래처, 브랜드, 사이트 등
 * @param url : 코드 리스트 조회용 URL
 * @param arrayObject : 결과 코드리스트를 저장할 배열
 * @param 콜백함수, optional
 */
var getCodeListByUrl = function(url, arrObj, cb) {

	return $.ajax({
		type: 'get',
		url: url,
		success : function(response) {

			var data = [];
			if(response.data) {	// 정상 Server Response 결과 값일 경우
				data = response.data.result;
			}

			for(var i=0; i<data.length; i++){
				arrObj.push(data[i]);
			}

			if (typeof cb === "function") {
				cb();
			}
		}
	});
}

var saveFileLocal = function(response, fileName) {
    var blob;
    // Old browser, need to use blob builder
    window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder;
    if (window.BlobBuilder) {
        var bb = new BlobBuilder();
        bb.append(response);
        blob = bb.getBlob("application/octet-stream");
        window.navigator.msSaveBlob(blob, fileName);
    } else {
        blob = new Blob([response], {type: "application/octet-stream"});
        var link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = fileName;
        link.click();
    }
    //window.URL.revokeObjectURL(this.src);
}

/*<![CDATA[*/
//$(document).ready(function() {
    /* // This will initialize the plugin ==> spring-boot properties 파일을 읽어서 사용할 경우.
    jQuery.i18n.properties({
        name:'backoffice',
        path:'/common/messageResource/properties/',
        mode:'map',
        language: locale,
        callback: function() {
            //swal($.i18n.prop('commerce.bo.intro'));
            // We specified mode: 'both' so translated values will be available as JS vars/functions and as a map
            // Both로 할 경우 JS vars 생성 시 key 이슈가 발생할 수 있어 map 으로 처리...
            // Accessing a simple value through the map
            $.i18n.prop('commerce.bo.intro');
            // Accessing a value with placeholders through the map
            $.i18n.prop('commerce.bo.intro', 'test str');

            // Accessing a simple value through a JS variable
            //alert(om.mng.title +' '+ om.mng.index);
            // Accessing a value with placeholders through a JS function
            //alert(om.mng.index('test str'));
        }
    }); */

    //import i18next from 'i18next';
    i18next
    .use(i18nextXHRBackend)	//https://github.com/i18next/i18next-xhr-backend
    //.use(Backend)
    //.use(i18nextBrowserLanguageDetector)
    .init({
    	keySeparator: ':',
    	lng: locale,
		fallbackLng: locale,
		debug: false,
		ns: ['backoffice'],
		defaultNS: 'backoffice',
		initImmediate: false,
		backend: {
            // load from back-end server
            loadPath: '/common/messageResource/getAllMessages/{{lng}}',
            crossDomain: true
      	}
    }, function(err, t) {
		// init set content
		// jqueryI18next.init(i18next, $);
		// https://github.com/i18next/jquery-i18next
		jqueryI18next.init(i18next, $, {
			tName: 't', // --> appends $.t = i18next.t
			i18nName: 'i18n', // --> appends $.i18n = i18next
			handleName: 'localize', // --> appends $(selector).localize(opts);
			selectorAttr: 'data-i18n', // selector for translating elements
			targetAttr: 'i18n-target', // data-() attribute to grab target element to translate (if diffrent then itself)
			optionsAttr: 'i18n-options', // data-() attribute that contains options, will load/set if useOptionsAttr = true
			useOptionsAttr: true, // see optionsAttr, 해당 값을 true 로 지정해야 jquery data-i18n-options 반영됨.
			parseDefaultValueFromContent: true // parses default values from content ele.val or ele.text
		});
		updateI18NextContent();
    });

    /* function changeLng(lng) {
    	i18next.changeLanguage(lng);
    }

   	i18next.on('languageChanged', () => {
   		updateI18NextContent();
   	}); */

//});

/**
* 모든 페이지에서 기본적으로 content 를 싸고 있는 .wrapper-content 를 기본적으로 localize 시키고
* 각 페이지에서 별도 구현 할 경우 아래 function 을 overrid.
*/
function updateI18NextContent() {
	$('.wrapper-content').localize();
}

/**
* Unauthorized 시 호출.
*/
function parentReload() {
	if(parent && parent.frames.length > 0) {
		//alert(parent.frames.length);
		parent.location.reload();
	}

    if(opener) {
        opener.location.reload();
        self.close();
    }
}

function i18n(msg) {
    var args = "\""+ msg + "\"";
    for (var i = 1; i < arguments.length; i++) {
           args += ", \"" + arguments[i] + "\"";
    }
    if (parent != this) {
           return eval("parent.i18n(" + args + ")");
    }
    return eval("jQuery.i18n.prop(" + args + ")");
}
/*]]>*/

$(document).on({
    'hidden.bs.modal': function() {
        if ($('.modal:visible').length > 0) {
            setTimeout(function() {
                $(document.body).addClass('modal-open');
            }, 0);
        }
    }
}, '.modal');

// https://tc39.github.io/ecma262/#sec-array.prototype.find
if (!Array.prototype.find) {
    Object.defineProperty(Array.prototype, 'find', {
        value: function(predicate) {
            // 1. Let O be ? ToObject(this value).
            if (this == null) {
                throw new TypeError('"this" is null or not defined');
            }

            var o = Object(this);

            // 2. Let len be ? ToLength(? Get(O, "length")).
            var len = o.length >>> 0;

            // 3. If IsCallable(predicate) is false, throw a TypeError exception.
            if (typeof predicate !== 'function') {
                throw new TypeError('predicate must be a function');
            }

            // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
            var thisArg = arguments[1];

            // 5. Let k be 0.
            var k = 0;

            // 6. Repeat, while k < len
            while (k < len) {
                // a. Let Pk be ! ToString(k).
                // b. Let kValue be ? Get(O, Pk).
                // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
                // d. If testResult is true, return kValue.
                var kValue = o[k];
                if (predicate.call(thisArg, kValue, k, o)) {
                    return kValue;
                }
                // e. Increase k by 1.
                k++;
            }

            // 7. Return undefined.
            return undefined;
        }
    });
}

if (!String.prototype.startsWith) {
    String.prototype.startsWith = function(searchString, position){
        position = position || 0;
        return this.substr(position, searchString.length) === searchString;
    };
}

// 공통 dateTimePicker 옵션
function commonDateTimePickerOptions(miStep) {
    if (typeof miStep !== "number") {
        miStep = 1;
    }

    if (miStep < 1) {
        miStep = 1;
     }

    return {
        format: "yyyy/mm/dd hh:ii",
        autoclose: true,
        todayHighlight: true,
        language: "ko",
        minuteStep: miStep,
        pickerPosition: "bottom-left",
        calendarWeeks: true,
        todayBtn: "linked",
        keyboardNavigation: false,
        forceParse: false
    };
}
