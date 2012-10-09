<?php 
class Model_Tileconfig
{
	/*----This function be used to authenticate the api.playup.com
	*/

	public function isContestLive ($contest_id){
		$contest = $this->get_contest_details(trim($contest_id));   
		if(strtotime($contest[scheduled_start_time]) > time())
			return true;
		else
			return false;
  	}

	public function get_contest_details($contest_id)
	{
		$url           = PLAYUP_FRIENDS_API_URL.$contest_id; //.$contest_id
		$s             = parse_url($url);

		$path          = $s['path'];
		//$str1          = SEED_INITIALIZER.';'.$access_token.';'.$path;
		//$header_value1 =  "PUToken ".$access_token." ".self::mcrypt_aes(ENCRYPTION_CYPHER,ENCRYPTION_MODE,$str1,PLAYUP_SECRET_KEY);
		$str2          =  SEED_INITIALIZER.';'.PLAYUP_STRING.';'.$path;
		$header_value2 =  PLAYUP_STRING." ".self::mcrypt_aes(ENCRYPTION_CYPHER,ENCRYPTION_MODE,$str2,PLAYUP_SECRET_KEY);
		$headers       = array(PLAYUP_API_KEY.': '.$header_value2);
		$output        = self::http_curl($url,$headers);

		$response_array = json_decode($output, true);  
		!empty($response_array) ? $response_array : false;
		    return $response_array;
		
	}

	public static function mcrypt_aes($cipher,$mode,$str,$secret_key) 
	{
	    $size = mcrypt_get_block_size($cipher, $mode); 
	    $str  = self::pkcs5_pad($str, $size); 
	    $td   = mcrypt_module_open($cipher, "", $mode, IV); 
	    mcrypt_generic_init($td, $secret_key, IV); 
	    $cyper_text = mcrypt_generic($td, $str); 
	    mcrypt_generic_deinit($td); 
	    mcrypt_module_close($td); 
	    return base64_encode($cyper_text); 
	}

	public static function pkcs5_pad ($text, $blocksize) 
	{ 
	    $pad = $blocksize - (strlen($text) % $blocksize); 
	    return $text . str_repeat(chr($pad), $pad); 
  	}

  	public static function http_curl($url, $header="", $parameters="") 
  	{
	    $ch = curl_init(); 
	    curl_setopt($ch, CURLOPT_URL, $url); 
	    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1); 
	    curl_setopt($ch, CURLOPT_HEADER, 0);
	    //curl_setopt($ch, CURLOPT_POSTFIELDS, $postfields); 
	    curl_setopt($ch,  CURLOPT_HTTPHEADER,$header);
	    $output = curl_exec($ch); 
	    curl_close($ch);
	    
	    return !empty($output) ? $output : false;
    }
  	

}
	


?>