server {
    listen 80;

    server_name api.tagfeeds.com;

    location / {
        proxy_pass http://localhost:3001;
	proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header Host $http_host;
    }
}
