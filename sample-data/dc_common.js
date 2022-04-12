/*
 * 갤러리, 메인, 디시콘 공통 스크립트
 * 2018.06.12 - mh
 * 
 */
var ci_t = get_cookie('ci_c');
var url = location.href.replace('https://','').replace(location.host + '/','').split('/');
var site = $(location).attr('host');

$(function() {
	//-------------------------------------------------------------
	// 패키지 상세보기
	//-------------------------------------------------------------
	$(document).on('click', '.div_package', function() {
		var target = $(this);
		var t_offset = target.offset();
		var package_idx = $(target).attr('package_idx') != undefined ? $(target).attr('package_idx') : '';
		var code = $(target).parent().parent().find('.written_dccon').index() >= 0 ? $(target).parent().parent().find('.written_dccon').attr('src').replace(/^.*no=/g, '').replace(/^&.*$/g, '') : '';
		var ajax_path = $(target).attr('reqpath') ? $(target).attr('reqpath') : '/index';
		
		var data_type = $(this).attr('data-type');
		var my_info_cls = ".cmt_info";
		if(data_type == 'reply') {
			my_info_cls = ".reply_info";
		}
		var no = $(this).parents(my_info_cls).attr('data-no');

		if (package_idx || code) {
			$.ajax({
				data : { 'ci_t' : ci_t, package_idx: package_idx, 'code' : code }
				, type : 'POST'
				, url : ajax_path + '/package_detail'
				, cache : false
				, async : true
				, success : function (data){
					if (data == "error") {
						alert('디시콘 정보가 잘못되었습니다.');
						return false;
					} else {
						if($("#package_detail").length > 0) $("#package_detail").remove();
						var temp = $.parseJSON(data);
						temp['reqpath'] = ajax_path;
						temp['comment_type'] = data_type;
						// 상세 정보창 보이기
						if(data_type == 'view') {
							$('#dccon_detail-tmpl').tmpl(temp).insertAfter(target.parents('.writing_view_box'));
							$('#package_detail').offset({ left: t_offset.left, top: t_offset.top -45 });
							$('#package_detail').data( "data", { package_idx: temp['info']['package_idx'], code: temp['info']['code'] , price: temp['info']['price']  , reqpath: temp['reqpath'] } );
						} else if(data_type == 'list') {
							$('#dccon_detail-tmpl').tmpl(temp).insertAfter(target.parent('.coment_dccon_info'));
							$('#package_detail').offset({ left: t_offset.left, top: t_offset.top -45 });
							$('#package_detail').data( "data", { package_idx: temp['info']['package_idx'], code: temp['info']['code'] , price: temp['info']['price']  , reqpath: temp['reqpath'] } );
						} else if(data_type == 'wrLayer') {
							$('#dccon_detail-tmpl').tmpl(temp).insertAfter(target.closest('.layer_dccon_info'));
							$('#package_detail').css('left', '13px').css('top', '112px');
							$('#package_detail').data( "data", { package_idx: temp['info']['package_idx'], code: temp['info']['code'] , price: temp['info']['price']  , reqpath: temp['reqpath'] } );
						} else {
							show_detail(temp , no , data_type);
						}
					}
				}
			});
		}
	});
	
	//-------------------------------------------------------------
	// 상세 정보 닫기
	//-------------------------------------------------------------
	$(document).on('click', '.package_close', function() {
		$(this).parents('#package_detail').hide();
	});

	//-------------------------------------------------------------
	// 상세 DIV 클릭 이벤트
	//-------------------------------------------------------------
	$(document).on('click', '#package_detail', function(e) {
		var target = e.target;
		var div = $('#package_detail');
		var package_idx = div.data("data").package_idx;
		var reqpath = div.data('data').reqpath;
		var ajax_path = reqpath ? reqpath : '/index';
		
		//-------------------------------------------------------------
		// 구매하기
		//-------------------------------------------------------------
		if ($(target).hasClass('btn_buy')) {
			var code = div.data( "data" ).code;
			var price = parseInt(div.data( "data" ).price);

			// 회원 만두 조회
			$.ajax({
				data : { 'ci_t' : ci_t, 'code' : code }
				, type : 'POST'
				, url : ajax_path +'/get_info'
				, cache : false
				, async : false
				, success : function (data){
					// 로그인
					if (data == "not_login") {
						location.href = "https://sign.dcinside.com/login?s_url=" + encodeURIComponent(location.href);
					// 정보 조회 실패
					} else if (data == "fail") {
						alert('만두 정보 조회에 실패하였습니다.[code=0]');
						return false;
					} else {
						// 무료 디시콘이라면 바로 구매 진행
						if (price == 0) {
							// 패키지 정보가 없을때
							if (!package_idx) {
								alert('정상적인 진행이 아닙니다.');
								return false;

							// 결제 진행
							} else {
								if (confirm('디시콘을 무료 구매하시겠습니까?')) {
									$.ajax({
										data : { 'ci_t' : ci_t, 'package_idx' : package_idx }
										, type : 'POST'
										, url : ajax_path +'/buy'
										, cache : false
										, async : false
										, success : function (data){
											// 로그인
											if (data == "not_login") {
												location.href = "https://sign.dcinside.com/login?s_url=" + encodeURIComponent(location.href);
											// 결제 실패
											} else if (data == "fail") {
												alert('디시콘 구매에 실패하였습니다.');
												$('#package_buy input').val('');
												$('#package_buy').hide();
												return false;

											// 결제 성공
											} else if (data == "ok") {
												alert('디시콘 구매가 완료되었습니다.');
												$('#package_buy input').val('');
												$('#package_buy').hide();
												$('.div_package').each(function() {
													if ($(this).data('package_idx') == package_idx) {
														$(this).data('package_idx', null);
													}
												});
												if(ajax_path != '/index') {
													location.reload();
												}
												return true;
											}
										}
									});
								}
							}
							div.hide();
							return false;
						} else {
							var temp = data.split('|');
							if (temp[0] == "ok") {
								var user_cash = parseInt(temp[1]);
								var use_cash = parseInt(price);
	
								// 보유 만두가 부족할 경우
								if (use_cash > user_cash) {
									var manduText = '';
									if($('.shop_cont').index() >= 0) {	// 디시콘 페이지일 경우 체크
										manduText = "\n상단의 만두 충전 메뉴에서 만두 충전 후 결제해주세요.";
									}
									alert('보유만두가 부족합니다.'+ manduText);
									return false;
								} else {
									// 구매팝업 데이터 정리
									var div_buy = $('#package_buy');
									div_buy.find('.title').text(div.find('.font_blue:first').text());
									div_buy.find('.user_cash').text(convMandoo(user_cash) + ' 개');
									div_buy.find('.use_cash').text(convMandoo(use_cash) + ' 개 ('+use_cash+' 원)');
									div_buy.css({ 'position' : div.css('position'),'top' : div.css('top'),'left' : div.css('left') }).show();
									div_buy.siblings().hide();
								}
							// 정상이 아님
							} else {
								alert('만두 정보 조회에 실패하였습니다.[code=1]');
								return false;
							}
						}
					}
				}
			});
		}

		//-------------------------------------------------------------
		// 신고창 보기
		//-------------------------------------------------------------
		if ($(target).hasClass('btn_report')) {
			var div = $('#package_detail');
			var div_singo = $('#package_singo');

			// 신고 내역 확인
			$.ajax({
				data : { 'ci_t' : ci_t, 'package_idx' : package_idx }
				, type : 'POST'
				, url : '/singo/check'
				, cache : false
				, async : false
				, success : function (data){
					// 로그인 안함
					if (data == "not_login") {
						alert('로그인 후 신고가능합니다.');
						return false;
					// 이미 가능한 신고 회수를 채움
					} else if (data == "already") {
						alert('이미 신고한 디시콘입니다');
						return false;
					// 신고 DIV 보이기
					} else if (data == "ok") {
						// 초기 값 저장
						div_singo.find('input, textarea').each(function() {
							if ($(this).val()) {
								$(this).data('ori_value', $(this).val());
							}
						});
						// 위치 세팅 후 보여주기
						//div_singo.css({ 'position' : div.css('position'),'top' : div.css('top'),'left' : div.css('left') }).show();
						div_singo.show();
						// 다른 div 숨기기
						div_singo.siblings().hide();
						div_singo.siblings('.dccon_popinfo , .package_close').show();
						
					} else {
						alert('비정상적인 접근입니다.');
						location.reload();
					}
				}
			});
		}

		//-------------------------------------------------------------
		// 판매중지창 보기
		//-------------------------------------------------------------
		if ($(target).hasClass('btn_stop_sales')) {
			var div = $('#package_detail');
			var div_sale = $('#package_stop_sale');

			//if (confirm('판매중지 신청 하시겠습니까? \n판매중지가 승인될 경우 7일간 디시콘 등록이 중지 됩니다.')) {
			if (confirm('판매중지 신청 하시겠습니까?')) {
				// 본인확인
				$.ajax({
					data : { 'ci_t' : ci_t, 'package_idx' : package_idx }
					, type : 'POST'
					, url : '/stop_sale/check'
					, cache : false
					, async : false
					, success : function (data){
						// 확인완료
						if (data == "ok") {
							div_sale.show();
						// 확인불가
						} else {
							data = data.split('|');
							if (data[1]) {
								alert(data[1]);
								return false;
							} else {
								alert('비정상적인 접근입니다.');
								location.reload();
							}
						}
					}
				});
			}
		}
	});
	
	//-------------------------------------------------------------
	// 판매중지 창 클릭 이벤트
	//-------------------------------------------------------------
	$(document).on('click', '#package_stop_sale', function(e) {
		var target = e.target;
		var div = $('#package_detail');
		var div_sale = $('#package_stop_sale');
		var package_idx = div.data('data').package_idx;

		//-------------------------------------------------------------
		// 등록
		//-------------------------------------------------------------
		if ($(target).hasClass('request')) {
			var memo = $.trim(div_sale.find('textarea[name=memo]').val());

			// 내용 없음
			if (!memo) {
				alert('내용을 입력해주세요.');
				div_sale.find('textarea[name=memo]').focus();
				return false;
			}

			// 내용 전송
			$.ajax({
				data : { 'ci_t' : ci_t, 'memo' : memo, 'package_idx' : package_idx }
				, type : 'POST'
				, url : '/stop_sale/regist'
				, cache : false
				, async : false
				, success : function (data){
					// 내용 없음
					if (data == "memo_empty") {
						alert('내용을 정확히 입력해주세요.\n태그는 사용할 수 없습니다.');
						div_sale.find('textarea[name=memo]').focus();
						return false;
					// 너무 김
					} else if (data == "too_long") {
						alert('내용은 최대 500자까지 입력해주세요.');
						return false;
					// 성공
					} else if (data == "ok") {
						alert('판매중지 신청이 정상 접수되었습니다.');
						clear_close(div_sale);
						return true;
					// 실패
					} else {
						data = data.split('|');
						if (data[1]) {
							alert(data[1]);
							return false;
						} else {
							alert('비정상적인 접근입니다.');
							location.reload();
						}
					}
				}
			});
		}

		//-------------------------------------------------------------
		// 판매중지창 닫기
		//-------------------------------------------------------------
		if ($(target).hasClass('btn_close') || $(target).hasClass('cancel')) {
			clear_close(div_sale);
		}
	});

	//-------------------------------------------------------------
	// 결제창 클릭 이벤트
	//-------------------------------------------------------------
	$(document).on('click', '#package_buy', function(e) {
		var target = e.target;
		var div = $('#package_buy');

		//-------------------------------------------------------------
		// 결제하기
		//-------------------------------------------------------------
		if ($(target).hasClass('payments')) {
			process_pay();
		}

		//-------------------------------------------------------------
		// 결제창 닫기
		//-------------------------------------------------------------
		if ($(target).hasClass('poply_bgblueclose') || $(target).hasClass('icon_bgblueclose') || $(target).hasClass('cancel')) {
			div.hide();
		}
	});

	//-------------------------------------------------------------
	// 결제 진행 함수
	//-------------------------------------------------------------
	var process_pay = function () {
		// 비밀번호 입력확인
		if(!$('#password').val()) {
			alert('비밀번호를 입력해주세요.');
			$('#password').focus();
			return false;
		}

		var div = $('#package_detail'); // 패키지 상세 정보 DIV
		//var package_idx = div.data('package_idx'); // 패키지 IDX
		//var use_cash = parseInt(div.data('price')); // 패키지 가격(원)
		
		var package_idx = div.data("data").package_idx;	// 패키지 IDX
		var use_cash = div.data("data").price;			// 패키지 가격(원)
		var reqpath = div.data("data").reqpath;
		var ajax_path = reqpath ? reqpath : '/index';
		//console.log(ajax_path);
		
		// 비밀번호 확인
		$.ajax({
			data : { 'ci_t' : ci_t, 'password' : $('#password').val() }
			, type : 'POST'
			, url : ajax_path +'/check_password'
			, cache : false
			, async : false
			, success : function (data){
				// 비밀번호 틀림
				if (data == "fail") {
					alert('비밀번호가 맞지 않습니다.');
					return false;
				} else if (data == "ok") {
					// 패키지 정보가 없을때
					if (!package_idx) {
						alert('정상적인 진행이 아닙니다.');
						return false;

					// 결제 진행
					} else {
						if (confirm('만두 '+convMandoo(use_cash)+'개를 사용하여 디시콘을 구매하시겠습니까?')) {
							$.ajax({
								data : { 'ci_t' : ci_t, 'package_idx' : package_idx }
								, type : 'POST'
								, url : ajax_path +'/buy'
								, cache : false
								, async : false
								, success : function (data){
									// 로그인
									if (data == "not_login") {
										location.href = "https://sign.dcinside.com/login?s_url=" + encodeURIComponent(location.href);
									// 결제 실패
									} else if (data == "fail") {
										alert('디시콘 구매에 실패하였습니다.');
										$('#package_buy input').val('');
										$('#package_buy').hide();
										return false;

									// 결제 성공
									} else if (data == "ok") {
										alert('디시콘 구매가 완료되었습니다.');
										$('#package_buy input').val('');
										$('#package_buy').hide();
										$('.div_package').each(function() {
											if ($(this).data('package_idx') == package_idx) {
												$(this).data('package_idx', null);
											}
										});
										return true;
									}
								}
							});
						}
					}
				}
			}
		});
	}

	//-------------------------------------------------------------
	// 비밀번호 입력후 엔터 처리
	//-------------------------------------------------------------
	$(document).on('keypress', '#package_buy #password', function(e) {
		var keyCode = e.keyCode;

		// ENTER 키
		if (keyCode == "13") {
			process_pay();
		}
	});

	//-------------------------------------------------------------
	// 신고창 클릭 이벤트
	//-------------------------------------------------------------
	$(document).on('click', '#package_singo', function(e) {
		var target = e.target;
		var div = $('#package_detail');
		var div_singo = $('#package_singo');
		var frm = $('#singo_form');

		// 등록
		if ($(target).hasClass('request')) {
			// 입력값 확인
			var memo = $.trim(frm.find('textarea[name=memo]').val());

			if (!memo) {
				alert('신고 내용을 입력해주세요.');
				frm.find('textarea[name=memo]').focus();
				return false;
			}

			// 데이터 정리
			frm.find('input[name=package_idx]').val(div.data("data").package_idx);
			var data = frm.serialize() + "&ci_t=" + ci_t;

			// 데이터 전송
			$.ajax({
				data : data
				, type : 'POST'
				, url : '/singo/regist'
				, cache : false
				, async : false
				, success : function (data){
					// 내용 없음
					if (data == "memo_empty") {
						alert('신고 내용을 정확히 입력해주세요.\n태그는 사용할 수 없습니다.');
						frm.find('textarea[name=memo]').focus();
						return false;
					// 이미 등록됨
					} else if (data == "already") {
						alert('이미 신고한 디시콘입니다');
						return false;
					// 너무 김
					} else if (data == "too_long") {
						alert('내용은 최대 500자까지 입력해주세요.');
						return false;
					// 성공
					} else if (data == "ok") {
						alert('신고내용이 정상 접수되었습니다.');
						clear_close(div_singo);
						return true;
					// 실패
					} else if (data == "fail") {
						alert('신고 등록에 실패하였습니다.');
						return false;
					}
				}
			});
		}

		//-------------------------------------------------------------
		// 신고창 닫기
		//-------------------------------------------------------------
		if ($(target).hasClass('btn_close') || $(target).hasClass('cancel')) {
			clear_close(div_singo);
		}
	});

	//-------------------------------------------------------------
	// 신고 파일 업로드 처리
	//-------------------------------------------------------------
	$(document).on('change', '#package_singo #singo_file', function() {
		var div = $('#package_detail');
		var frm = $('#singo_form');
		if ($(this).val()) {
			frm.attr('action', '//upimg.dcinside.com/dccon_singo.php');
			frm.attr('target', 'singo_frame');
			frm.find('input[name=package_idx]').val(div.data("data").package_idx);
			frm.submit();
		}
	});
});

//-------------------------------------------------------------
// 아이콘 상세 내역 보기
//-------------------------------------------------------------
var show_detail = function (tar, no,data_type) {
	var div = $('#package_detail');

	//gallery
	if($('.view_comment ul.cmt_list').index() >= 0) {
		if(data_type == 'reply' || data_type == 'comment') {
			var type_reply = '#' + data_type + '_li_' + no + ' .comment_dccon:eq(0)';
		} else {
			var type_reply = '.coment_dccon_info';			
		}
		
		$('#dccon_detail-tmpl').tmpl(tar).insertAfter(type_reply);
	} else if(site == 'www.dcinside.com') {
		if(div.length > 0) {
			$('#dccon_detail-tmpl').tmpl(tar).replaceAll(div);
		} else {
			$('#dccon_detail-tmpl').tmpl(tar).insertAfter('.dccon');
		}
	} else {
		if(div.length > 0) {
			$('#dccon_detail-tmpl').tmpl(tar).replaceAll(div);
		} else {
			$('#dccon_detail-tmpl').tmpl(tar).insertAfter('.bottom_paging_box');
		}

	}

	$('#package_detail').data( "data", { package_idx: tar['info']['package_idx'], code: tar['info']['code'] , price: tar['info']['price']  , reqpath: tar['reqpath'] } );
}

// 만두 변환
function convMandoo (val) {
	var tmp = val/110;
	var str = String(tmp).split('.');
	if (str[1] == undefined) {
		return tmp;
	} else {
		return tmp.toFixed(2);
	}
}