export default function UserPage({ params }: { params: { name: string } }) {
  return <p className="p-4">{params.name}'s Page!</p>;
}
