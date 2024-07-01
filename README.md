# Plataforma de Gobernanza para un Servicio de Interpretación 
Desarrollo de una plataforma de gobernanza para un servicio de interpretación, Trabajo de Fin de Grado realizado por Jesús Cobos Pozo.
 
## Introducción

La gobernanza es un aspecto fundamental en cualquier sistema que requiere la toma de decisiones colectivas y la gestión eficiente de recursos y actividades. En el contexto de un servicio de interpretación para eventos multilingües, la gobernanza se refiere a cómo se establecen y aplican las políticas del servicio, cómo se gestionan las decisiones operativas y cómo se supervisa el cumplimiento de estas políticas para asegurar un funcionamiento efectivo y transparente.

En esta plataforma de gobernanza, las decisiones se toman de manera justa y participativa. Esto implica un proceso de votación donde el peso de cada voto está ligado a la reputación del votante, construida a partir de la contribución y el desempeño previo del usuario. Este enfoque ayuda a prevenir problemas comunes en sistemas de votación y promueve una participación activa y constructiva. Para fomentar la participación y mantener la integridad del sistema, se implementan mecanismos de premios y penalizaciones. Estos incentivos no solo motivan a los usuarios a participar activamente, sino que también aseguran que las decisiones se tomen de manera informada y responsable.

## Descripción del Proyecto
El proyecto de plataforma de gobernanza para el servicio de interpretación ha sido desarrollado para mejorar la gestión y la toma de decisiones dentro de una estructura organizativa similar a la de una empresa. Este proyecto se enfoca en la implementación de una serie de funcionalidades diseñadas para facilitar la gobernanza efectiva y transparente de un servicio de interpretación, utilizando tecnologías avanzadas y enfoques innovadores.

## Requisitos

Antes de proceder con la instalación, asegúrese de tener instalados los siguientes componentes:

- **Git**: Para clonar el repositorio desde GitHub. [Descargar Git](https://git-scm.com/downloads)
- **Node.js**: Para ejecutar el servidor de la plataforma. [Descargar Node.js](https://nodejs.org/en/)

Además, para visualizar correctamente las vistas EJS en su editor de código, se recomienda instalar la extensión **EJS language support** en VS Code. Esta extensión proporciona soporte avanzado para el lenguaje EJS, facilitando la edición y la visualización de archivos EJS dentro de su entorno de desarrollo.

## Entorno de Desarrollo

- Sistema Operativo: `Windows 10`
- Editor de Código: `Visual Studio Code`
- Navegador: `Google Chrome`

## Versiones de Herramientas y Paquetes Utilizados

- Git: `2.45.2`
- Node.js: `20.9.0`
- VS Code: `1.90.2`
- Google Chrome: `126.0.6478.127`

### Paquetes Extra Utilizados Dentro del Proyecto

connect-flash: `^0.1.1`; 
cookie-parser: `~1.4.4`: 
debug: `~2.6.9`; 
ejs: `~2.6.1`; 
express: `~4.16.1`; 
express-generator: `^4.16.1`; 
express-partials: `^0.3.0`; 
express-session: `^1.18.0`; 
http-errors: `~1.6.3`; 
method-override: `^3.0.0`; 
morgan: `~1.9.1`; 
multer: `^1.4.5-lts.1`; 
node-cron: `^3.0.3`; 
sequelize: `^6.37.2`; 
sequelize-cli: `^6.6.2`; 
sqlite3: `^5.1.7`; 
supervisor: `^0.12.0`; 

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

#### Tokens

Los tokens representan una forma de moneda interna dentro de la plataforma y son asignados como premio o penalización en las propuestas. Los tokens son la recompensa que se obtiene en las propuestas, pudiendo ganarlas o perderlas en función de los resultados de dichas propuestas. Los tokens no solo facilitan la participación activa en la plataforma, sino que también son fundamentales para calcular la reputación de los usuarios dentro de cada equipo. 

#### Wallets

Cada usuario posee una wallet por cada equipo al que pertenece, que actúa como una billetera virtual, almacenando los puntos que pueden ser utilizados en las propuestas. Los puntos en las wallets son cruciales para las votaciones de las propuestas, ya que se utilizan para votar a favor, en contra o abstenerse en una propuesta. Estos puntos son apostados en las votaciones, y la cantidad apostada influye en el peso del voto del usuario. Esta funcionalidad fomenta una participación activa y estratégica en las decisiones del equipo.

#### Reputación

La reputación de un usuario dentro de un equipo se mide por el porcentaje de tokens que posee en comparación con la suma total de tokens distribuidos entre todos los miembros del equipo. Este sistema de reputación es vital porque potencia el peso de los votos en las propuestas. Por ejemplo, si un usuario tiene una reputación del 75% en un equipo y vota con 5 puntos de su wallet en una propuesta, su voto se ponderará según su reputación, multiplicando los puntos votados por 1.75. Este enfoque incentiva a los usuarios a mejorar su reputación dentro de los equipos, ya que una mayor reputación se traduce en un voto más influyente. Este sistema asegura que aquellos que contribuyen más y tienen una mayor inversión en el equipo tengan una mayor voz en las decisiones, promoviendo así un ambiente de meritocracia y compromiso continuo.

### Equipos
La plataforma facilita la creación y gestión de equipos, proporcionando una estructura organizativa para colaborar eficazmente en proyectos y tomar decisiones conjuntas. Cada equipo está identificado por un título y una descripción que detalla sus objetivos, con transparencia sobre su creador y una imagen distintiva para una fácil identificación. Los equipos pueden tener múltiples miembros, lo que fomenta la colaboración interdisciplinaria y permite a los usuarios participar en las propuestas específicas de cada equipo.

Cada usuario puede pertenecer a varios equipos simultáneamente, gestionando una wallet, tokens y reputación para cada uno. Estos elementos reflejan la participación y contribución de los usuarios dentro del equipo, influyendo en su capacidad para votar y participar en las decisiones. Los miembros pueden donar puntos de sus wallets a otros, promoviendo la colaboración y reconociendo las contribuciones individuales.

Los equipos pueden ser creados, editados o eliminados según las necesidades, con la posibilidad de aplicar funciones administrativas como la inflación de tokens para ajustar la economía interna. Además, la plataforma ofrece recompensas diarias que permiten a los usuarios reclamar puntos adicionales para votar, incentivando la participación continua y activa.

### Propuestas
La plataforma permite la creación y votación de propuestas, fomentando la participación y la toma de decisiones colectivas entre los usuarios. Cualquier miembro con los permisos adecuados puede proponer iniciativas dentro de sus equipos para ser evaluadas y votadas.

Cada propuesta está compuesta por un título descriptivo, una detallada descripción de su contenido y objetivos, y es creada por un autor claramente identificado. Cada propuesta se asocia a un equipo específico, permitiendo que los miembros voten en las cuestiones que afectan directamente a su ámbito de trabajo.

Durante la votación, los usuarios deben apostar puntos desde su wallet asociada al equipo para participar. Cada voto puede ser a favor, en contra o abstenerse, reflejando puntos apostados que se multiplican por la reputación del usuario en el equipo. Esto asegura que aquellos con una mayor inversión y compromiso tengan una influencia proporcionalmente mayor en las decisiones.

Las propuestas tienen fechas definidas para inicio, fin de votación y aplicación, además de una fecha límite de veto administrativo. Los usuarios pueden cambiar su voto en cualquier momento durante el periodo de votación. La plataforma también recompensa la participación con puntos y tokens, proporcionando incentivos adicionales si el resultado final coincide con el voto del usuario.

Si una propuesta recibe más votos a favor que en contra y cumple con el número mínimo de participantes, se aprueba y se implementa según la fecha establecida. En caso contrario, la propuesta es rechazada y no se lleva a cabo. En situaciones especiales como el veto administrativo o falta de participantes, la propuesta se cancela y se devuelven los puntos apostados.

Además, la plataforma ofrece funcionalidades de filtrado para mostrar propuestas según su estado (Sin empezar, En curso, Finalizadas y Vetadas), facilitando la navegación y gestión eficiente de las mismas.

### Roles y Permisos
La plataforma implementa un sistema de roles y permisos diseñado para gestionar de manera eficiente las acciones de los usuarios y prevenir el mal uso de las funciones disponibles. Cada rol tiene permisos específicos que determinan sus responsabilidades y áreas de control.

El Administrador es el rol principal de la plataforma, con autoridad para administrar todos los aspectos del sistema. Esto incluye la gestión de usuarios, la edición y eliminación de equipos y propuestas, así como la asignación de roles a otros usuarios. Además, el Administrador puede aplicar vetos a propuestas y gestionar la inflación de tokens en los equipos, garantizando el orden y la integridad de la plataforma.

El Administrador de Equipos tiene la capacidad de crear, editar y eliminar equipos dentro de la plataforma. Este rol es fundamental para organizar y gestionar la colaboración efectiva entre los miembros de cada equipo, asegurando que se cumplan los objetivos establecidos.

Los Administradores de Propuestas pueden crear, editar y eliminar propuestas en la plataforma. Su función es crucial para gestionar ideas y proyectos, asegurando que las propuestas se presenten adecuadamente y se sometan a votación en el momento oportuno.

El Administrador de Puntos administra los puntos de las wallets y tokens de los usuarios. Esto incluye la capacidad de asignar y retirar puntos según sea necesario para mantener el equilibrio económico de la plataforma y recompensar las contribuciones de manera justa.

Todos los roles pueden ser asignados o revocados por el Administrador General en cualquier momento, lo que proporciona flexibilidad y adaptabilidad en la gestión de la plataforma. Además, se ha implementado un sistema que permite a los usuarios mantener el control sobre los equipos o propuestas que hayan creado, incluso después de que se les haya revocado el rol correspondiente, garantizando así la continuidad y responsabilidad en las tareas específicas asignadas.

### Manejo de Eliminaciones
La plataforma mantiene registros detallados de Equipos Eliminados y Propuestas Eliminadas para proporcionar transparencia y rastreabilidad. Estos registros permiten a los usuarios conocer qué equipos o propuestas existieron en el pasado y quién realizó la eliminación.

Cuando se elimina una propuesta, todos sus datos se borran completamente de la plataforma. La propuesta eliminada se registra en el Registro de Propuestas Eliminadas junto con la fecha de eliminación y el responsable de la acción. En caso de que la propuesta estuviera en período de votación, se devuelven los puntos apostados por los usuarios a sus wallets respectivas antes de eliminarla.

La eliminación de un equipo implica la eliminación de todos los datos asociados a ese equipo, incluidas todas las propuestas vinculadas. El equipo eliminado se registra en el Registro de Equipos Eliminados con información detallada sobre la fecha de eliminación y quién realizó la acción. Todas las propuestas asociadas al equipo también se eliminan y se registran en el Registro de Propuestas Eliminadas.

Cuando un usuario es eliminado de la plataforma, ya sea voluntariamente o por decisión del Administrador, se borra completamente su perfil. Esto incluye la eliminación de sus votos en propuestas en curso y la desvinculación de los equipos a los que pertenecía, ajustando automáticamente el recuento de miembros en esos equipos. Los votos del usuario en propuestas finalizadas o no iniciadas no se alteran para preservar los resultados históricos.

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

 