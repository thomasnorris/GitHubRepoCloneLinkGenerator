(function() {
    const GITHUB_API_BASE_URL = 'https://api.github.com';
    const GITHUB_REPOS_URL = '/user/repos';
    const AUTH_FILE_NAME = 'OAuthToken.txt';

    var _request = require('request');

    var requestOptions = {
        url: '\"' + GITHUB_API_BASE_URL + GITHUB_REPOS_URL + '\"',
        headers: {
            'Authorization': 'Bearer ' + GetOAuthToken()
        }
    };

    console.log(requestOptions);

    function GetOAuthToken() {
        return 'fsdfsdfdsdf';
    }

})();