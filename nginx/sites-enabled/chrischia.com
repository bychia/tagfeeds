server {
    listen 80;

    server_name chrischia.com www.chrischia.com chrischia.info www.chrischia.info;

    location / {
        proxy_pass http://localhost:3002;
	proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header Host $http_host;
    }
}
