# Canal de Slack

Canal de Slack para utlizar en Botpress.

### Prerequisitos
 - node v10
 - yarn
 
### Instalación

    yarn build:botpress

### Comandos disponibles

#### `yarn start:botpress`
Inicia botpress.

#### `yarn watch`
Recompila el módulo en cada cambio

#### `yarn build`
Compila el módulo

#### `yarn package`
Arma un archivo `channel-slack-av.tgz` listo para la distribución.

### Permisos
Se utilizan los siguientes permisos de Slack:
 - `users:read`: permite obtener información general acerca de la persona que está hablando con el bot.
