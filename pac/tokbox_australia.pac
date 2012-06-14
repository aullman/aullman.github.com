function FindProxyForURL(url, host) {
	if (host.indexOf("corp.tokbox.com") >= 0 || host.indexOf("really.tokbox.com") >= 0) {
		return "SOCKS localhost:9999";
	}
	return "DIRECT";
}
