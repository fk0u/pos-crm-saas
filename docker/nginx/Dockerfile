FROM omnipoint-pos-app:latest AS app

FROM nginx:alpine

COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=app /var/www/public /var/www/public

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

