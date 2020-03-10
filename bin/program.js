(function() {
    // The name of the SSH config file Host to use (optional parameter)
    var _ssh_config_name = process.argv.slice(2)[0];

    var _rl = require('readline-sync');
    var _clip = require('clipboardy');

    const GITHUB_API_BASE_URL = 'https://api.github.com';
    const GITHUB_REPOS_URL = '/user/repos';
    const AUTH_FILE_FULL_PATH = __dirname + '\\' + 'OAuthToken.txt';
    const CLONE_ALIAS = 'g clo';

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
                var repos = [];
                var count = 0;
                JSON.parse(body).forEach((key) => {
                    var url = key.ssh_url;
                    var full_name = key.full_name;
                    var folder = key.name;

                    if (_ssh_config_name)
                        url = url.replace('github.com', _ssh_config_name);

                    repos.push({
                        url: url,
                        full_name: full_name,
                        folder: folder
                    });

                    console.log(count++ + ': ' + full_name);
                });

                var index = _rl.question('\nChoose repo [0 - ' + (repos.length - 1) +'][-1 to exit]: ');
                if (index === '-1')
                    Exit('Exiting.');

                var repo = repos[index];
                if (!repo)
                    Exit('Undefined index.');

                var link = repo.url;
                var addAlias = _rl.question('Add "' + CLONE_ALIAS + '" to the beginning? [y/n][default is y]: ');
                if (addAlias.toLowerCase() !== 'n')
                    link = CLONE_ALIAS + ' ' + link;

                var cdRepo = ' && cd ' + repo.folder;
                var copyFolder = _rl.question('Add "' + cdRepo + '" at the end? [y/n][default is y]: ');
                if (copyFolder.toLowerCase() !== 'n')
                    link += cdRepo;

                _clip.writeSync(link);

                Exit('\nLink for repo "' + repo.full_name + '" copied to clipboard.');
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