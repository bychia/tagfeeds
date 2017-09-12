server {
    listen 80;

    server_name tagfeeds.com www.tagfeeds.com;

    location / {
        proxy_pass http://localhost:3000;
	proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header Host $http_host;
    }
}
