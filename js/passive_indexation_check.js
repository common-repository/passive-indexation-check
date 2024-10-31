var passiveIndexationCheckJS = (function ($) {

    var adminNoticeId = '#passiveIdentificationCheckNotice',
        emailNoticeId = '#passiveIdentificationCheckEmailNotice';

    var _private = {
        /**
         *
         * Send AJAX post request to WordPress AJAX url.
         *
         * @param  {string}   formId      Form id.
         * @param  {object}   extraParams Extra parameters to be added besides form data.
         * @param  {Function} callback    Callback for returning data.
         *
         * @return {void}
         *
         */
        sendRequest: function (formId, extraParams, callback) {
            var data = false;

            if (formId) {
                data = $('form#' + formId).serialize();
            }
            if (extraParams) {
                data = data ? data + '&' + $.param(extraParams) : $.param(extraParams);
            }

            $.ajax({
                url: ajaxurl,
                type: 'POST',
                data: data,
                success: function (data, successCode, jqXHR) {
                    data.reqStatus = jqXHR.status;
                    callback(data);
                },
                error: function (jqXHR, textStatus, error) {
                    var data = {
                        reqStatus: jqXHR.status
                    };
                    callback(data);
                }
            });
        },
        /**
         *
         * Handle WP notification message.
         *
         * @param  {object} data Data that was returned by plugin AJAX action.
         *
         * @return {void}
         */
        triggerMessage: function (data) {
            $(adminNoticeId).removeClass('error updated').hide();

            if (_private.isRequestSuccessfull(data)) {
                if (data.success) {
                    $(adminNoticeId).addClass('updated').
                        html(_private.wrapMessage(data.data.msg));
                } else {
                    $(adminNoticeId).addClass('error').
                        html(_private.wrapMessage(data.data.msg));
                }
            } else {
                var msg = 'There was a ' + data.reqStatus + ' error while trying to complete your request.';
                $(adminNoticeId).addClass('error').
                    html(_private.wrapMessage(msg));
            }

            $(adminNoticeId).show(300);

        },
        isRequestSuccessfull: function (data) {
            if (data.reqStatus >= 200 && data.reqStatus <= 226) {
                return true;
            }
            return false;
        },
        /**
         *
         * Helper function for wrapping provided string into paragraph.
         *
         * @param  {string} message String you wish to wrap in paragraph (<p>).
         *
         * @return {string}         Returns wrapped string.
         *
         */
        wrapMessage: function (message) {
            return '<p>' + message + '</p>';
        },
        updateEmailsList: function (emails) {
            var emailsHtml = '';
            for (var email in emails) {
                if (emails.hasOwnProperty(email)) {
                    emailsHtml += '<span>' + email + '<span>';
                    emailsHtml += '<a class="passive_email" data-email="' + email + '">';
                    emailsHtml += ' <span class="dashicons dashicons-no-alt"></span>';
                    emailsHtml += '</a><br>';
                }
            }
            if (emailsHtml.length == 0) {
                $(emailNoticeId).show();
            } else {
                $(emailNoticeId).hide();
            }
            $('#passiveIndexationCheckEmailsList').html(emailsHtml);
        },

        // Request functions

        /**
         *
         * Add email request.
         *
         * Sends form data to backend and adds email to notification list.
         *
         */
        addEmail: function () {
            var extraParams = {
                action: 'passive_indexation_check_add_email'
            };

            _private.sendRequest('passiveIndexationCheckForm', extraParams, function (data) {
                if (_private.isRequestSuccessfull(data)) {
                    if (data.success) {
                        _private.updateEmailsList(data.data.emails);
                        $('input[name=added_notifier]').val('');
                    }
                }
                _private.triggerMessage(data);
            });
        },
        /**
         *
         * Send delete email from notifiers to backend.
         *
         * @param  {string} email Email to delete.
         *
         * @return {void}
         *
         */
        deleteEmail: function (email) {
            var extraParams = {
                action: 'passive_indexation_check_delete_email',
                delete_notifier: email
            };

            _private.sendRequest('passiveIndexationCheckForm', extraParams, function (data) {
                if (_private.isRequestSuccessfull(data)) {
                    if (data.success) {
                        _private.updateEmailsList(data.data.emails);
                    }
                }
                _private.triggerMessage(data);
            });
        },
        /**
         *
         * Update plugin settings request.
         *
         * @param  {string} formId Form id that we will send serialized to the backend.
         *
         * @return {void}
         *
         */
        updateSettings: function (formId) {
            var extraParams = {
                action: 'passive_indexation_check_update_settings'
            };

            _private.sendRequest(formId, extraParams, function (data) {
                if (_private.isRequestSuccessfull(data)) {
                    if (data.success) {
                        _private.updateEmailsList(data.data.emails);
                        $('form#passiveIndexationCheckForm input[name=added_notifier]').val('');
                        $('form#passiveIndexationCheckForm #sendTreshold').val(data.data.options.sendTreshold);
                    }
                }
                _private.triggerMessage(data);
            });
        },

    };

    var _public = {};

    $(document).ready(function () {
        $('#passiveIndexationCheckAddEmail').on('click', function (event) {
            event.preventDefault();
            _private.addEmail();
        });
        $('form#passiveIndexationCheckForm').on('submit', function (event) {
            event.preventDefault();
            _private.updateSettings('passiveIndexationCheckForm');
        });
        $('#passiveIndexationCheckEmailsList').on('click', '.passive_email', function () {
            var email = $(this).attr('data-email');
            _private.deleteEmail(email);
        });
    });

    return _public;

})(jQuery);
