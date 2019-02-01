(function() {
    const GITHUB_API_BASE_URL = 'https://api.github.com';
    const GITHUB_REPOS_URL = '/user/repos';
    const AUTH_FILE_NAME = 'OAuthToken.txt';

    var _request = require('request');

    GetOAuthToken((token) => {
        var requestOptions = {
            url: GITHUB_API_BASE_URL + GITHUB_REPOS_URL,
            headers: {
                'User-Agent': 'request',
                'Authorization': 'Bearer ' + token
            }
        };

        _request(requestOptions, (err, res, body) => {
            console.log(res.statusCode);
        });
    });

    function GetOAuthToken(callback) {
        CheckFileExists(() => {
            var lr = require('line-reader');

            lr.eachLine(AUTH_FILE_NAME, (line, last) => {
                callback(line.split('\"').join(''));
            });
        });

        function CheckFileExists(callback) {
            var fs = require('fs');
            fs.access(AUTH_FILE_NAME, fs.constants.F_OK, (err) => {
                if (err === null)
                    callback();
                else {
                    console.log('File \"' + AUTH_FILE_NAME + '\" does not exist, exiting.');
                    process.exit(0);
                };
            });
        };
    };

})();