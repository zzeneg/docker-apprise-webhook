# docker-alertmanager-apprise
 Prometheus AlertManager webhook receiver for Apprise

Allows to receive alerts from AlertManager and send them to [Apprise](https://github.com/caronc/apprise) using a custom template.

Default template is in the Markdown format. You can specify your own template by mounting it to `/app/template.njk`. Template is using [nunjucks](https://mozilla.github.io/nunjucks/) templating engine.

## Usage
- docker-compose example
  ```yaml
  apprise:
    container_name: apprise
    image: caronc/apprise
    restart: unless-stopped
    ports:
      - 8000:8000
    environment:
      APPRISE_STATELESS_URLS: tgram://${TELEGRAM_LOGGER_TOKEN}/${TELEGRAM_LOGGER_CHATID}?format=markdown

  alertmanager-apprise:
    container_name: alertmanager-apprise
    image: zzeneg/alertmanager-apprise
    restart: unless-stopped
    ports:
      - 3000:3000
    environment:
      APPRISE_URL: http://apprise:8000/notify
    volumes:
      - ./template.njk:/app/template.njk #custom template
  ```
- AlertManager configuration (`alertmanager.yml`)
  ```yaml
  route:
    receiver: 'apprise'

  receivers:
    - name: 'apprise'
      webhook_configs:
        - send_resolved: true
          url: http://alertmanager-apprise:3000
  ```