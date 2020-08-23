# Canal de Slack

Canal de Slack para utlizar en Botpress.

### Prerequisitos

 - [Docker](https://www.docker.com/)
 
### Iniciar

    $ docker-compose up -d

Se inicia el proceso que recompila automáticamente el módulo. Es necesario iniciar botpress manualmente. Para ello ejecutar:

    $ docker-compose exec botpress bash
    $ yarn start

#### Botpress

Se puede acceder a bopress en [localhost:3000](http://localhost:3000).

#### Ngrok

También se inicia [ngrok](https://ngrok.com) para exponer el servidor desde la web. Para obtener la url externa se puede ver en los logs con `docker-compose logs ngrok`, ir a [localhost:4040](http://localhost:4040/) o ver la variable de ambiente `EXTERNAL_URL` en el container de botpress.

### Comandos disponibles

A todos los comandos siguientes se les debe anteponer `docker-compose exec botpress`.

#### `cd modules/channel-slack-av && yarn build`
Compila el módulo

#### `cd modules/channel-slack-av && yarn package`
Arma un archivo `channel-slack-av.tgz` listo para la distribución.

### Logs
Se pueden activar los logs del módulo desde botpress accediendo a `Debug`.

### Permisos
Se utilizan los siguientes permisos de Slack:
 - `users:read`: permite obtener información general acerca de la persona que está hablando con el bot.

