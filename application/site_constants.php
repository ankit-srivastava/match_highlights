<?php
define('BASE_URL','http://'.$_SERVER['HTTP_HOST'].'/');
define('BASE_PATH',$_SERVER['DOCUMENT_ROOT']);
define('IMAGE_PATH',BASE_URL."images/");

define('ENCRYPTION_CYPHER','rijndael-128');
define('ENCRYPTION_MODE', 'cbc');
define('PLAYUP_SECRET_KEY','fJirDB7n4MIgdEnD');
define('PLAYUP_STRING','com.playup.extensions.india');
define('SEED_INITIALIZER',10);
define('PLAYUP_FRIENDS_API_URL','http://api.playup.com/sportsdata/contests/');
define('AUTHORIZATION_KEY','Authorization');
define('PLAYUP_API_KEY','X-Playup-Api-Key');
define('IV',"\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00");

?>