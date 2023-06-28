// 前端網頁要用的邏輯都在這

// TODO: 寫成一個JSON檔去處理，為了之後的i18n
const text_sign_up = "報名";
const text_date = "日期";
const text_description = "資訊";
const text_number = "剩餘名額";
const text_place_of_test = "考試地點";
const text_type_of_test = "駕照種類";
const text_date_of_test = "考試日期";
const text_desc = "場次組別說明";
const text_cancel = "取消報名";
$(function () {
    // TODO:想更好的命名
    $("#datepickerExpectExamDateStr").datepicker({
        defaultDate: "+2",
        duration: "slow",
        dateFormat: "yy-mm-dd",
        minDate: "0d",
        maxDate: "+30d",
    });
    const datePickerBirthdatConfig = {
        duration: "slow",
        dateFormat: "yy-mm-dd",
        minDate: "-100y",
        maxDate: "-18y",
        changeMonth: true,
        changeYear: true,
        showMonthAfterYear: true,
        yearRange: "-75:-18",
    };
    $("#datepickerBirthdayStr").datepicker(datePickerBirthdatConfig);
    $("#datepickerBirthdayStrResults").datepicker(datePickerBirthdatConfig);
    $("#btn_session").on("click", function () {
        $(".loading").show();
        $.ajax({
            type: "GET",
            url: "/sessions",
            dataType: "json",
            data: $("#sessionsForm").serialize(),
            success: function (response) {
                console.log($("form").serializeArray()[0]);
                let html = `<table border="1" class="table table-hover">\
                            <thead class="table-dark">\
                                <tr>\
                                <th scope="col" class="col-2">${text_date}</th>\
                                <th scope="col" class="col-8">${text_description}</th>\
                                <th colspan="2" scope="col" class="col-1">${text_number}</th>\
                                <th scope="col" class="col-1"></th>\
                                </tr>\
                            </thead>`;
                const data = response["data"];
                console.log(data.length);
                for (let i = 0; i < data.length; i++) {
                    console.log(data[i]);
                    html = html + "<tr>";
                    html = html + `<td class="col-2">${data[i].date}</td>`;
                    html =
                        html + `<td class="col-8">${data[i].description}</td>`;
                    html = html + `<td class="col-1">${data[i].number}</td>`;
                    let btn_sign_up = "";
                    if (data[i].number > 0) {
                        btn_sign_up = `<button type="button" name="btn_sign_up" class="btn btn-success" expectExamDateStr='${data[i].expectExamDateStr}' secId='${data[i].secId}' divId='${data[i].divId}'>${text_sign_up}</button>`;
                    }
                    html = html + `<td class="col-1">${btn_sign_up}</td>`;
                    html = html + "</tr>";
                }
                html = html + "</table>";
                $("#result").html(html);
                $("#result").slideDown(1000);

                // 報名 button
                $(".btn.btn-success").on("click", function () {
                    // 除了目前要報名的那場以外都隱藏
                    $(this).parent().parent().siblings().hide(); // console.log($(this).parent().parent().css('background-color', '#000000'));
                    $("#signUpForm").slideDown("slow");
                    $("#licenseTypeCode").val(
                        $("#licenseTypeCodeSelect").find(":selected").val()
                    );
                    $("#secDateStr").val($(this).attr("expectExamDateStr"));
                    $("#dmvNo").val($("#dmvNoSelect").find(":selected").val());
                    $("#secId").val($(this).attr("secId"));
                    $("#divId").val($(this).attr("divId"));
                });
            },
            error: function (thrownError) {
                console.log(thrownError);
            },
            // 如果寫在AJAX外，show完會直接hide，AJAX才回傳結果
            complete: function (param) {
                $(".loading").hide();
            },
        });
    });
    // 查詢報名狀態
    $("#btn_results").on("click", function () {
        $(".loading").show();
        $.ajax({
            type: "GET",
            url: "/results",
            dataType: "json",
            data: {
                idNo: $("#idNoResults").val(),
                birthdayStr: $("#datepickerBirthdayStrResults").val(),
            },
            success: function (response) {
                let html = `<table border="1" class="table table-hover">\
                            <thead class="table-dark">\
                                <tr>\
                                <th scope="col" class="col-1">${text_place_of_test}</th>\
                                <th scope="col" class="col-1">${text_type_of_test}</th>\
                                <th scope="col" class="col-1">${text_date_of_test}</th>\
                                <th scope="col" class="col-7" colspan="2" >${text_desc}</th>\
                                <th scope="col" class="col-2"></th>\
                                </tr>\
                            </thead>`;
                const data = response["data"];
                // TODO: 把條件寫上去，如果查詢不到結果時應該怎麼處理比較好
                let _bt = "";
                html = html + "<tr>";

                if (data.reservationPK !== "") {
                    _bt = `<button type="button" id="btn_deleteResults" name="btn_deleteResults" class="btn btn-danger" reservationPK='${data.reservationPK}' >${text_cancel}</button>`;
                    html =
                        html +
                        `<td class="col-1">${data.result.place_of_test}</td>`;
                    html =
                        html +
                        `<td class="col-1">${data.result.type_of_test}</td>`;
                    html =
                        html +
                        `<td class="col-1">${data.result.date_of_test}</td>`;
                    html = html + `<td class="col-7">${data.result.desc}</td>`;
                    html = html + `<td class="col-2">${_bt}</td>`;
                } else {
                    alert(data.message);
                    html =
                        html +
                        `<td class="col-12" colspan="4">${data.message}</td>`;
                }

                html = html + "</tr>";
                html = html + "</table>";
                $("#result").html(html);
                $("#result").slideDown(1000);

                $("#btn_deleteResults").on("click", function () {
                    $(".loading").show();
                    //TODO: 拿取消報名的id打API去取消並顯示結果成功與否
                    $.ajax({
                        type: "DELETE",
                        url: `/results?${$.param({
                            reservationPK:
                                $("#btn_deleteResults").attr("reservationPK"),
                        })}`,
                        dataType: "json",
                        success: function (response) {
                            alert(response["data"]);
                            $("#result").slideUp(1000);
                        },
                        error: function (thrownError) {
                            console.log(thrownError);
                        },
                        complete: function (param) {
                            $(".loading").hide();
                        },
                    });
                });
            },
            error: function (thrownError) {
                console.log(thrownError);
            },
            complete: function (param) {
                $(".loading").hide();
            },
        });
    });
    $("#btn_signUp").on("click", function (e) {
        // TODO: 搞清楚為何這時會重新整理畫面，導致後面的alert會消失，進而讓使用者不知道報名成功沒有
        e.preventDefault();
        $(".loading").show();
        $.ajax({
            type: "POST",
            url: "/sessions",
            contentType: "application/json; charset=utf-8", // 要送到server的資料型態
            dataType: "json",
            // serialize()是給字串，該如何以id轉換成對應的JSON key-value，這就很可能要應用component之類的概念
            data: JSON.stringify({
                licenseTypeCode: $("#licenseTypeCode").val(),
                secDateStr: $("#secDateStr").val(),
                dmvNo: $("#dmvNo").val(),
                secId: $("#secId").val(),
                divId: $("#divId").val(),
                idNo: $("#idNo").val(),
                birthdayStr: $("#datepickerBirthdayStr").val(),
                name: $("#name").val(),
                contactTel: $("#contactTel").val(),
                email: $("#email").val(),
            }),
            success: function (response) {
                alert("報名成功");
            },
            error: function (thrownError) {
                console.log(thrownError);
            },
            complete: function (param) {
                $(".loading").hide();
            },
        });
        $("#signUpForm").slideUp("slow");
    });
});
