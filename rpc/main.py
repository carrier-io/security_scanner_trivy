from pylon.core.tools import log  # pylint: disable=E0611,E0401
from pylon.core.tools import web

from tools import rpc_tools


class RPC:
    integration_name = 'security_scanner_trivy'

    @web.rpc(f'dusty_config_{integration_name}')
    @rpc_tools.wrap_exceptions(RuntimeError)
    def make_dusty_config(self, context, test_params, scanner_params):
        """ Prepare dusty config for this scanner """
        source = test_params['source']
        source_container = source['name'] == "container"
        code = source['image_name'] if source_container else '/tmp/code' 
        result = {'code': code, **scanner_params}
        return "trivy", result
