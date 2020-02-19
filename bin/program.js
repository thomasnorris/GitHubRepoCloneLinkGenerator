(function() {
    // The name of the SSH config file Host to use (optional parameter)
    var _ssh_config_name = process.argv.slice(2)[0];

    var _rl = require('readline');
    var _clip = require('clipboardy');

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
            var rl = _rl.createInterface({
                input: process.stdin,
                output: process.stdout
            });

            if (!err && res.statusCode === 200) {
                var repos = [];
                var count = 0;
                JSON.parse(body).forEach((key) => {
                    var url = key.ssh_url;
                    var full_name = key.full_name;

                    if (_ssh_config_name)
                        url = url.replace('github.com', _ssh_config_name);

                    repos.push({
                        url: url,
                        full_name: full_name
                    });

                    console.log(count++ + ': ' + full_name);
                });

                rl.question('\nEnter repo index to copy [0 - ' + (repos.length - 1) +'] [-1 to exit]: ', (index) => {
                    rl.close();
                    if (index === '-1')
                        Exit('Exiting.');

                    var repo = repos[index];
                    if (!repo)
                        Exit('Undefined index.');

                    _clip.writeSync(repo.url);

                    Exit('Clone link for \"' + repo.full_name + '\" copied to the clipboard.');
                });
            }
            else
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