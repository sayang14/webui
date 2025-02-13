import "reflect-metadata";
import { Container, interfaces } from "inversify";
import { IronSession } from "iron-session";
import { NextApiResponse } from "next";
import CONTROLLERS from "./ioc-symbols-controllers";
import INPUT_PORT from "../../../common/ioc/ioc-symbols-input-port";
import USECASE_FACTORY from "./ioc-symbols-usecase-factory";
import GATEWAYS from "./ioc-symbols-gateway";
import AuthServerGatewayOutputPort from "@/lib/core/port/secondary/auth-server-gateway-output-port";
import RucioAuthServer from "@/lib/infrastructure/gateway/rucio-auth-server";
import EnvConfigGatewayOutputPort from "@/lib/core/port/secondary/env-config-gateway-output-port";
import EnvConfigGateway from "../../gateway/env-config-gateway";
import UserPassLoginInputPort from "@/lib/core/port/primary/userpass-login-input-port";
import UserPassLoginUseCase from "@/lib/core/use-case/userpass-login-usecase";
import UserPassLoginController, {IUserPassLoginController} from "@/lib/infrastructure/controller/userpass-login-controller";
import UserPassLoginPresenter from "@/lib/infrastructure/presenter/usepass-login-presenter";
import LoginConfigInputPort from "@/lib/core/port/primary/login-config-input-port";
import LoginConfigUseCase from "@/lib/core/use-case/login-config-usecase";
import LoginConfigPresenter from "@/lib/infrastructure/presenter/login-config-presenter";
import LoginConfigController, {ILoginConfigController} from "@/lib/infrastructure/controller/login-config-controller";

/**
 * IoC Container configuration for the application.
 */
const appContainer = new Container();

appContainer.bind<AuthServerGatewayOutputPort>(GATEWAYS.AUTH_SERVER).to(RucioAuthServer);
appContainer.bind<EnvConfigGatewayOutputPort>(GATEWAYS.ENV_CONFIG).to(EnvConfigGateway);

appContainer.bind<UserPassLoginInputPort>(INPUT_PORT.USERPASS_LOGIN).to(UserPassLoginUseCase).inRequestScope();
appContainer.bind<IUserPassLoginController>(CONTROLLERS.USERPASS_LOGIN).to(UserPassLoginController);
appContainer.bind<interfaces.Factory<UserPassLoginInputPort>>(USECASE_FACTORY.USERPASS_LOGIN).toFactory<UserPassLoginUseCase, [IronSession, NextApiResponse]>((context: interfaces.Context) =>
    (session: IronSession, response: NextApiResponse) => {
        const rucioAuthServer: AuthServerGatewayOutputPort = appContainer.get(GATEWAYS.AUTH_SERVER)
        return new UserPassLoginUseCase(new UserPassLoginPresenter(session, response), rucioAuthServer);
    }
);

appContainer.bind<LoginConfigInputPort>(INPUT_PORT.LOGIN_CONFIG).to(LoginConfigUseCase).inRequestScope();
appContainer.bind<ILoginConfigController>(CONTROLLERS.LOGIN_CONFIG).to(LoginConfigController);
appContainer.bind<interfaces.Factory<LoginConfigInputPort>>(USECASE_FACTORY.LOGIN_CONFIG).toFactory<LoginConfigUseCase, [IronSession, NextApiResponse]>((context: interfaces.Context) =>
    (session: IronSession, response: NextApiResponse) => {
        const envConfigGateway: EnvConfigGatewayOutputPort = appContainer.get(GATEWAYS.ENV_CONFIG)
        return new LoginConfigUseCase(new LoginConfigPresenter(session, response), envConfigGateway);
    }
);

export default appContainer;