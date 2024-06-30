# Plataforma de Gobernanza para un Servicio de Interpretación 
Desarrollo de una plataforma de gobernanza para un servicio de interpretación, Trabajo de Fin de Grado realizado por Jesús Cobos Pozo.
 
## Introducción

La **Plataforma de Gobernanza para un Servicio de Interpretación** es una solución desarrollada para mejorar la gestión operativa y administrativa de un servicio de interpretación. La plataforma permite la participación activa de los usuarios en la toma de decisiones a través de sistemas de votación basados en tokens y reputación. Este proyecto busca proporcionar un entorno colaborativo donde los diferentes equipos y usuarios puedan interactuar eficientemente, presentando propuestas, votando, y gestionando recursos de manera eficiente.

La gobernanza es un aspecto fundamental en cualquier sistema que requiere la toma de decisiones colectivas y la gestión eficiente de recursos y actividades. En el contexto de un servicio de interpretación para eventos multilingües, la gobernanza se refiere a cómo se establecen y aplican las políticas del servicio, cómo se gestionan las decisiones operativas y cómo se supervisa el cumplimiento de estas políticas para asegurar un funcionamiento efectivo y transparente.

En esta plataforma de gobernanza, las decisiones se toman de manera justa y participativa. Esto implica un proceso de votación donde el peso de cada voto está ligado a la reputación del votante, construida a partir de la contribución y el desempeño previo del usuario. Este enfoque ayuda a prevenir problemas comunes en sistemas de votación y promueve una participación activa y constructiva. Para fomentar la participación y mantener la integridad del sistema, se implementan mecanismos de premios y penalizaciones. Estos incentivos no solo motivan a los usuarios a participar activamente, sino que también aseguran que las decisiones se tomen de manera informada y responsable.

## Descripción del Proyecto
El proyecto de plataforma de gobernanza para el servicio de interpretación ha sido desarrollado para mejorar la gestión y la toma de decisiones dentro de una estructura organizativa similar a la de una empresa. Este proyecto se enfoca en la implementación de una serie de funcionalidades diseñadas para facilitar la gobernanza efectiva y transparente de un servicio de interpretación, utilizando tecnologías avanzadas y enfoques innovadores.

## Requisitos

Antes de proceder con la instalación, asegúrese de tener instalados los siguientes componentes:

- **Git**: Para clonar el repositorio desde GitHub. [Descargar Git](https://git-scm.com/downloads)
- **Node.js**: Para ejecutar el servidor de la plataforma. [Descargar Node.js](https://nodejs.org/en/)
- **Complemento EJS**: Para visualizar correctamente las vistas EJS en su editor de código.

## Instalación

### Paso 1: Clonar el Repositorio

Abra una terminal y clone el repositorio desde GitHub utilizando el siguiente comando:

```sh
git clone https://github.com/jcobosp/Plataforma_de_gobernanza_para_un_servicio_de_interpretacion.git
```

### Paso 2: Navegar al Directorio del Proyecto

Cambie al directorio del proyecto:

```sh
cd Plataforma_de_gobernanza_para_un_servicio_de_interpretacion
```

### Paso 3: Instalar Dependencias

Instale las dependencias del proyecto ejecutando el siguiente comando:

```sh
npm install
```

### Paso 4: Ejecutar la Plataforma

Inicie el servidor de la plataforma con el comando:

```sh
npm start
```

### Paso 5: Acceder a la Plataforma

Abra su navegador web y visite la dirección:

```sh
http://localhost:3000
```

## Funcionalidades de la Plataforma

### Gestión de Usuarios
La plataforma permite a los usuarios registrarse, iniciar sesión, editar su perfil, y eliminar su cuenta. También incluye un mecanismo de tiempo de inactividad que expira la sesión de usuario tras 5 minutos de inactividad. Los usuarios pueden cerrar sesión en cualquier momento para asegurar la seguridad de su cuenta.

### Sistema de Tokens, Wallets y Reputación
El sistema de Tokens, Wallets y Reputación es fundamental para incentivar la participación activa y gestionar la economía interna de la plataforma. Cada usuario tiene asociada una wallet, tokens y reputación específicos para cada equipo al que pertenece. Si un usuario forma parte de varios equipos, gestionará estos elementos de forma independiente para cada uno, lo que facilita medir y recompensar sus contribuciones de manera precisa.

#### TOKENS

Los tokens representan una forma de moneda interna dentro de la plataforma y son asignados como premio o penalización en las propuestas. Los tokens son la recompensa que se obtiene en las propuestas, pudiendo ganarlas o perderlas en función de los resultados de dichas propuestas. Los tokens no solo facilitan la participación activa en la plataforma, sino que también son fundamentales para calcular la reputación de los usuarios dentro de cada equipo. 

#### WALLETS

Cada usuario posee una wallet por cada equipo al que pertenece, que actúa como una billetera virtual, almacenando los puntos que pueden ser utilizados en las propuestas. Los puntos en las wallets son cruciales para las votaciones de las propuestas, ya que se utilizan para votar a favor, en contra o abstenerse en una propuesta. Estos puntos son apostados en las votaciones, y la cantidad apostada influye en el peso del voto del usuario. Esta funcionalidad fomenta una participación activa y estratégica en las decisiones del equipo.

#### REPUTACIÓN

La reputación de un usuario dentro de un equipo se mide por el porcentaje de tokens que posee en comparación con la suma total de tokens distribuidos entre todos los miembros del equipo. Este sistema de reputación es vital porque potencia el peso de los votos en las propuestas. Por ejemplo, si un usuario tiene una reputación del 75% en un equipo y vota con 5 puntos de su wallet en una propuesta, su voto se ponderará según su reputación, multiplicando los puntos votados por 1.75. Este enfoque incentiva a los usuarios a mejorar su reputación dentro de los equipos, ya que una mayor reputación se traduce en un voto más influyente. Este sistema asegura que aquellos que contribuyen más y tienen una mayor inversión en el equipo tengan una mayor voz en las decisiones, promoviendo así un ambiente de meritocracia y compromiso continuo.

### Equipos
Los usuarios, con los permisos adecuados, pueden crear, unirse y gestionar equipos. Cada usuario perteneciente a un equipo tiene su propio conjunto de tokens, puntos y reputación asociados a dicho equipo. Los usuarios pueden donar puntos a otros miembros del equipo y recibir puntos cuando se unen a un equipo por primera vez. También hay un sistema de inflación de tokens y un registro de usuarios en equipos para mantener la integridad del historial de participación.

### Propuestas
La plataforma facilita la creación y votación de propuestas. Los usuarios, con los permisos adecuados, pueden crear propuestas con un título, descripción y periodo de votación, entre otras caracteristicas. Las propuestas están asociadas a equipos específicos, y los miembros del equipo pueden votar utilizando puntos de sus wallets. El sistema incluye recompensas y penalizaciones para incentivar la participación y asegurar decisiones informadas.

### Roles y Permisos
La plataforma incluye un sistema de roles y permisos para gestionar las acciones que los usuarios pueden realizar. Hay roles específicos como Administrador General, Administrador de Equipos, Administrador de Propuestas y Administrador de Puntos, cada uno con permisos definidos para asegurar un control adecuado y prevenir abusos.

### Manejo de Eliminaciones
La plataforma mantiene registros de equipos y propuestas eliminadas. Cuando se elimina un equipo o una propuesta, todos los datos asociados se registran, y los puntos apostados en propuestas en curso se devuelven a los usuarios. Esto asegura la transparencia y permite mantener un historial claro de actividades.

## Datos Iniciales

La plataforma viene preconfigurada con datos iniciales para facilitar la prueba de sus funcionalidades. Estos datos incluyen equipos, propuestas y usuarios ya cargados en la base de datos.

### Equipos Predefinidos

- Interpretación
- Administración
- Investigación y Desarrollo
- Marketing
- Coordinación y Documentación
- Gestión

### Propuestas Predefinidas

1. Mejora en la Formación Continua de los Intérpretes
2. Mejora del Entorno de Trabajo y Bienestar del Personal
3. Desarrollo de una Aplicación Móvil para Clientes
4. Campaña de Marketing Digital en Redes Sociales
5. Implementación de una Herramienta de Gestión de Proyectos
6. Digitalización de Documentos y Archivos

Cada propuesta tiene sus datos correspondientes ya cargados. Para demostrar las diversas funcionalidades de la plataforma en acción, se han incluido varios escenarios: una propuesta cuya fecha de votación aún no ha comenzado, otra actualmente en periodo de votación activo, algunas con el periodo de votación finalizado, y una última donde se ha aplicado el veto por parte del administrador. Estos casos proporcionan una visión completa de cómo la plataforma gestiona y muestra el ciclo de vida de las propuestas, desde su presentación hasta la conclusión de su evaluación.

### Usuarios Preconfigurados

- **Administrador**: Todos los roles activados.
  - Nombre de usuario: `Administrador`
  - Contraseña: `1234`
- **Jesús Cobos**: Sin roles activados.
  - Nombre de usuario: `Jesús Cobos`
  - Contraseña: `1234`
- **Ana Rodríguez**: Rol de administrador de puntos activado.
  - Nombre de usuario: `ana_rodriguez`
  - Contraseña: `1234`
- **Carlos Martínez**: Rol de administrador de equipos activado.
  - Nombre de usuario: `carlos_martinez`
  - Contraseña: `1234`
- **David Fernández**: Sin roles activados.
  - Nombre de usuario: `davidfernandez`
  - Contraseña: `1234`
- **Laura Gómez**: Roles de administrador de propuestas y equipos activados.
  - Nombre de usuario: `lauragomez`
  - Contraseña: `1234`

Los usuarios pueden iniciar sesión utilizando las credenciales proporcionadas en la pantalla de inicio de sesión de la plataforma, respetando el uso de mayúsculas, minúsculas, espacios y carácteres especiales a la hora de introducir las credenciales.

