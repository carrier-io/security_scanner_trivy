from typing import Optional, List
from pylon.core.tools import log
from pydantic import BaseModel, validator


class IntegrationModel(BaseModel):
    timeout: Optional[str] = "1h"
    skip_update: Optional[bool] = True
    show_without_fix: Optional[bool] = False
    show_with_temp_id: Optional[bool] = False
    show_without_description: Optional[bool] = True
    trivy_options: Optional[str] = "--no-progress"
    # save_intermediates_to: Optional[str] = '/data/intermediates/sast'

    def check_connection(self) -> bool:
        try:
            return True
        except Exception as e:
            log.exception(e)
            return False
