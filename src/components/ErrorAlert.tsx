interface IProps {
  errorText: string;
  onClose: () => void;
}

export const ErrorAlert = ({errorText, onClose}: IProps) => (
<div className="fixed bg-[--red-light] mx-auto w-[90%] sm:w-3/4 max-w-md bottom-0 mb-10 h-24 rounded-md p-6 text-white">
  <button className="absolute top-2 right-4 text-lg" onClick={onClose}>x</button>
  <p className="text-center">
    {errorText}
  </p>
</div>  
)