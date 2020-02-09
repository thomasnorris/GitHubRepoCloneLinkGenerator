(function() {
    // The name of the SSH config file Host to use (optional parameter)
    var _ssh_config_name = process.argv.slice(2)[0];

    const GITHUB_API_BASE_URL = 'https://api.github.com';
    const GITHUB_REPOS_URL = '/user/repos';
    const AUTH_FILE_FULL_PATH = __dirname + '\\' + 'OAuthToken.txt';

    GetOAuthToken((token) => {
        var request = require('request');
        var requestOptions = {
            url: GITHUB_API_BASE_URL + GITHUB_REPOS_URL,
            headers: {
                'User-Agent': 'request',
                'Authorization': 'Bearer ' + token
            }
        };

        request(requestOptions, (err, res, body) => {
            if (!err && res.statusCode === 200) {
                console.log('Copy any of these links to clone via ssh:\n');

                JSON.parse(body).forEach((key) => {
                    var url = key.ssh_url;
                    if (_ssh_config_name)
                        url = url.replace('github.com', _ssh_config_name);

                    console.log(url);
                });

                Exit();
            }

            Exit('There was an error with the request. Status code: ' + res.statusCode)
        });
    });

    function GetOAuthToken(callback) {
        var fs = require('fs');
        fs.access(AUTH_FILE_FULL_PATH, fs.constants.F_OK, (err) => {
            if (err !== null)
                Exit('File \"' + AUTH_FILE_FULL_PATH + '\" does not exist, exiting.');

            require('line-reader').eachLine(AUTH_FILE_FULL_PATH, (line, last) => {
                callback(line.split('\"').join(''));
            });
        });
    }

    function Exit(message = '') {
        if (message !== '')
            console.log(message);
        process.exit(0);
    }

})();