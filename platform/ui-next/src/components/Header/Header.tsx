import React, { ReactNode, useState } from 'react';
import classNames from 'classnames';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  Icons,
  Button,
  ToolButton,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '../';
import { IconPresentationProvider } from '@ohif/ui-next';

import NavBar from '../NavBar';
import { batchCheckService } from '@ohif/app/src/utils/taskApi';
import { useProjectConfig } from '@ohif/app/src/state/projectConfig';

// Todo: we should move this component to composition and remove props base

interface HeaderProps {
  children?: ReactNode;
  menuOptions: Array<{
    title: string;
    icon?: string;
    onClick: () => void;
  }>;
  isReturnEnabled?: boolean;
  onClickReturnButton?: () => void;
  isSticky?: boolean;
  WhiteLabeling?: {
    createLogoComponentFn?: (React: any, props: any) => ReactNode;
  };
  PatientInfo?: ReactNode;
  Secondary?: ReactNode;
  UndoRedo?: ReactNode;
}

/** 从入口 URL 读取查询参数（统一小写 key） */
function getUrlParam(key: string): string {
  if (typeof window === 'undefined') {
    return '';
  }
  return new URLSearchParams(window.location.search).get(key) ?? '';
}

function Header({
  children,
  menuOptions,
  isReturnEnabled = true,
  onClickReturnButton,
  isSticky = false,
  WhiteLabeling,
  PatientInfo,
  UndoRedo,
  Secondary,
  ...props
}: HeaderProps): ReactNode {
  const [isPassDialogOpen, setIsPassDialogOpen] = useState(false);
  const [isPassing, setIsPassing] = useState(false);
  const [isDenyDialogOpen, setIsDenyDialogOpen] = useState(false);
  const [isDenying, setIsDenying] = useState(false);
  const [result, setResult] = useState<{ type: 'pass' | 'deny'; success: boolean; msg: string } | null>(
    null
  );

  // 业务参数来自 mark-conf 写入的 projectConfig；use_time / spot_check_pack_id 来自入口 URL
  const [projectConfig] = useProjectConfig();

  const onClickReturn = () => {
    if (isReturnEnabled && onClickReturnButton) {
      onClickReturnButton();
    }
  };

  const handleConfirmPass = async () => {
    setIsPassing(true);

    try {
      const res = await batchCheckService({
        time: new Date().getTime(),
        package_id: projectConfig?.package_id!,
        task_key: projectConfig?.task_key!,
        work_type: getUrlParam('work_type'),
        access: getUrlParam('access'),
        action: 'pass', // "pass" "deny"
        use_time: Number(getUrlParam('use_time')),
        is_package: 1,
        status: getUrlParam('status'),
        spot_check_pack_id: getUrlParam('spot_check_pack_id'),
      });

      if (res.code !== '') {
        // TODO: 处理失败场景（如 toast 提示 res.msg）
        console.error('整题通过失败:', res.msg);
        setResult({ type: 'pass', success: false, msg: res.msg || '整题通过失败' });
      } else {
        setResult({ type: 'pass', success: true, msg: '通过完成' });
      }
    } catch (err) {
      // TODO: 处理网络异常
      console.error('整题通过请求异常:', err);
      setResult({ type: 'pass', success: false, msg: '整题通过请求异常' });
    } finally {
      setIsPassing(false);
      setIsPassDialogOpen(false);
    }
  };

  const handleConfirmDeny = async () => {
    setIsDenying(true);

    try {
      const res = await batchCheckService({
        time: new Date().getTime(),
        package_id: projectConfig?.package_id!,
        task_key: projectConfig?.task_key!,
        work_type: getUrlParam('work_type'),
        access: getUrlParam('access'),
        action: 'deny',
        use_time: Number(getUrlParam('use_time')),
        is_package: 1,
        status: getUrlParam('status'),
        spot_check_pack_id: getUrlParam('spot_check_pack_id'),
      });

      if (res.code !== '') {
        // TODO: 处理失败场景（如 toast 提示 res.msg）
        console.error('整题驳回失败:', res.msg);
        setResult({ type: 'deny', success: false, msg: res.msg || '整题驳回失败' });
      } else {
        setResult({ type: 'deny', success: true, msg: '驳回完成' });
      }
    } catch (err) {
      // TODO: 处理网络异常
      console.error('整题驳回请求异常:', err);
      setResult({ type: 'deny', success: false, msg: '整题驳回请求异常' });
    } finally {
      setIsDenying(false);
      setIsDenyDialogOpen(false);
    }
  };

  return (
    <IconPresentationProvider
      size="large"
      IconContainer={ToolButton}
    >
      <NavBar
        isSticky={isSticky}
        {...props}
      >
        <div className="relative h-[48px] items-center">
          <div className="absolute left-0 top-1/2 flex -translate-y-1/2 items-center">
            <div
              className={classNames(
                'mr-3 inline-flex items-center',
                isReturnEnabled && 'cursor-pointer'
              )}
              onClick={onClickReturn}
              data-cy="return-to-work-list"
            >
              {isReturnEnabled && <Icons.ArrowLeft className="text-primary ml-1 h-7 w-7" />}
              <div className="ml-1">
                {WhiteLabeling?.createLogoComponentFn?.(React, props) || <Icons.OHIFLogo />}
              </div>
            </div>
          </div>
          <div className="absolute top-1/2 left-[250px] h-8 -translate-y-1/2">{Secondary}</div>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform">
            <div className="flex items-center justify-center space-x-2">{children}</div>
          </div>
          <div className="absolute right-0 top-1/2 flex -translate-y-1/2 select-none items-center">
            <Button
              variant="ghost"
              className="text-primary hover:bg-primary-dark h-full"
              onClick={() => setIsPassDialogOpen(true)}
            >
              整题通过
            </Button>
            <Dialog
              open={isPassDialogOpen}
              onOpenChange={setIsPassDialogOpen}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>整题通过</DialogTitle>
                  <DialogDescription>
                    确定要整题通过吗？此操作将标记该病例为通过。
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="ghost"
                    onClick={() => setIsPassDialogOpen(false)}
                  >
                    取消
                  </Button>
                  <Button
                    onClick={handleConfirmPass}
                    disabled={isPassing}
                  >
                    {isPassing ? '提交中…' : '确定'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button
              variant="ghost"
              className="text-primary hover:bg-primary-dark h-full"
              onClick={() => setIsDenyDialogOpen(true)}
            >
              整题驳回
            </Button>
            <Dialog
              open={isDenyDialogOpen}
              onOpenChange={setIsDenyDialogOpen}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>整题驳回</DialogTitle>
                  <DialogDescription>
                    确定要整题驳回吗？此操作将标记该病例为驳回。
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="ghost"
                    onClick={() => setIsDenyDialogOpen(false)}
                  >
                    取消
                  </Button>
                  <Button
                    onClick={handleConfirmDeny}
                    disabled={isDenying}
                  >
                    {isDenying ? '提交中…' : '确定'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Dialog
              open={result !== null}
              onOpenChange={(open) => {
                if (!open) {
                  setResult(null);
                }
              }}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {result?.type === 'deny' ? '整题驳回' : '整题通过'}
                  </DialogTitle>
                  <DialogDescription>
                    {result?.success
                      ? result.type === 'deny'
                        ? '驳回完成'
                        : '通过完成'
                      : result?.msg || '操作未完成'}
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="ghost"
                    onClick={() => setResult(null)}
                  >
                    关闭
                  </Button>
                  <Button
                    onClick={() => {
                      setResult(null);
                      window.close();
                    }}
                  >
                    退出页面
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            {UndoRedo}
            <div className="border-primary-dark mx-1.5 h-[25px] border-r"></div>
            {PatientInfo}
            <div className="border-primary-dark mx-1.5 h-[25px] border-r"></div>
            {/* <div className="flex-shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-primary hover:bg-primary-dark mt-2 h-full w-full"
                  >
                    <Icons.GearSettings />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {menuOptions.map((option, index) => {
                    const IconComponent = option.icon
                      ? Icons[option.icon as keyof typeof Icons]
                      : null;
                    return (
                      <DropdownMenuItem
                        key={index}
                        onSelect={option.onClick}
                        className="flex items-center gap-2 py-2"
                      >
                        {IconComponent && (
                          <span className="flex h-4 w-4 items-center justify-center">
                            <Icons.ByName name={option.icon} />
                          </span>
                        )}
                        <span className="flex-1">{option.title}</span>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div> */}
          </div>
        </div>
      </NavBar>
    </IconPresentationProvider>
  );
}

export default Header;
